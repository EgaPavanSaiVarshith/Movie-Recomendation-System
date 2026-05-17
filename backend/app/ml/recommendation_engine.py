import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from typing import List, Dict, Optional, Tuple
import asyncio
from app.core.database import get_database

# Internal box office weight multipliers (never exposed publicly)
INTERNAL_BOX_OFFICE_WEIGHTS = {
    "blockbuster": 1.5,    # $500M+
    "hit": 1.3,             # $200M-$500M
    "average": 1.1,         # $100M-$200M
    "below_average": 0.9,   # <$100M
    "unknown": 1.0
}

MOOD_GENRE_MAP = {
    "happy": ["Comedy", "Animation", "Family", "Music", "Romance"],
    "sad": ["Drama", "Romance"],
    "excited": ["Action", "Adventure", "Thriller", "Sci-Fi"],
    "scared": ["Horror", "Thriller", "Mystery"],
    "thoughtful": ["Documentary", "Drama", "History"],
    "romantic": ["Romance", "Drama"],
    "adventurous": ["Adventure", "Action", "Fantasy"],
    "relaxed": ["Comedy", "Family", "Animation"],
}

class RecommendationEngine:
    def __init__(self):
        self.tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
        self.scaler = MinMaxScaler()
        self._movie_cache = []
        self._cosine_sim = None
        self._df = None
    
    def _build_feature_string(self, movie: dict) -> str:
        """Build a rich feature string for TF-IDF vectorization."""
        parts = []
        title = movie.get("title", "")
        overview = movie.get("overview", "") or ""
        genres = " ".join(movie.get("genres", []))
        language = movie.get("language", "") or ""
        
        # Repeat genres and title for higher weight
        parts.append(title * 2)
        parts.append(genres * 3)
        parts.append(overview)
        parts.append(language * 2)
        
        return " ".join(parts).lower()
    
    def _compute_internal_score(self, movie: dict) -> float:
        """
        Compute a hidden internal recommendation score using:
        - Popularity
        - Vote average & count
        - Box office tier (internal only, never shown)
        - Recency bonus
        """
        popularity = movie.get("popularity", 0) or 0
        vote_avg = movie.get("vote_average", 0) or 0
        vote_count = movie.get("vote_count", 0) or 0
        
        # Popularity score (log-normalized)
        pop_score = np.log1p(popularity) / 10.0
        
        # Rating score
        rating_score = (vote_avg / 10.0) * min(1.0, np.log1p(vote_count) / 10.0)
        
        # Box office hidden multiplier
        box_office_tier = movie.get("box_office_tier", "unknown")
        bo_multiplier = INTERNAL_BOX_OFFICE_WEIGHTS.get(box_office_tier, 1.0)
        
        # Recency bonus (movies from last 2 years get +10%)
        release_date = movie.get("release_date", "") or ""
        recency_bonus = 1.0
        if release_date and len(release_date) >= 4:
            try:
                year = int(release_date[:4])
                if year >= 2023:
                    recency_bonus = 1.15
                elif year >= 2021:
                    recency_bonus = 1.05
            except:
                pass
        
        # Weighted combination (box office is internal only)
        base_score = (0.4 * pop_score + 0.6 * rating_score) * bo_multiplier * recency_bonus
        return round(min(base_score, 1.0), 4)
    
    async def load_movies(self, movies: List[dict]):
        """Load and index movies for recommendation."""
        self._movie_cache = movies
        if len(movies) < 2:
            return
        
        df = pd.DataFrame(movies)
        df["feature_string"] = df.apply(self._build_feature_string, axis=1)
        df["internal_score"] = df.apply(self._compute_internal_score, axis=1)
        
        # Build TF-IDF matrix
        tfidf_matrix = self.tfidf.fit_transform(df["feature_string"].fillna(""))
        self._cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        self._df = df
    
    def get_content_based(self, movie_id: int, n: int = 12) -> List[dict]:
        """Content-based filtering using TF-IDF cosine similarity."""
        if self._df is None or self._cosine_sim is None:
            return []
        
        idx_matches = self._df[self._df["tmdb_id"] == movie_id].index
        if len(idx_matches) == 0:
            return []
        
        idx = idx_matches[0]
        sim_scores = list(enumerate(self._cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [s for s in sim_scores if s[0] != idx][:n*2]
        
        results = []
        for i, score in sim_scores[:n]:
            movie = self._movie_cache[i].copy()
            movie["similarity_score"] = round(float(score), 4)
            # Remove hidden fields before returning
            movie.pop("box_office_tier", None)
            movie.pop("internal_score", None)
            results.append(movie)
        
        return results
    
    def get_genre_based(self, genres: List[str], n: int = 20, exclude_ids: List[int] = []) -> List[dict]:
        """Get movies based on genre similarity."""
        if self._df is None:
            return []
        
        genre_set = set(genres)
        results = []
        
        for movie in self._movie_cache:
            if movie.get("tmdb_id") in exclude_ids:
                continue
            movie_genres = set(movie.get("genres", []))
            overlap = len(genre_set & movie_genres)
            if overlap > 0:
                m = movie.copy()
                m["genre_match"] = overlap
                m.pop("box_office_tier", None)
                m.pop("internal_score", None)
                results.append(m)
        
        results.sort(key=lambda x: (x.get("genre_match", 0), x.get("vote_average", 0)), reverse=True)
        return results[:n]
    
    def get_mood_based(self, mood: str, n: int = 20) -> List[dict]:
        """Get movies based on user mood."""
        target_genres = MOOD_GENRE_MAP.get(mood.lower(), ["Drama", "Comedy"])
        return self.get_genre_based(target_genres, n)
    
    async def get_collaborative(self, user_id: str, n: int = 20) -> List[dict]:
        """
        Collaborative filtering: find similar users and recommend 
        movies they liked that the current user hasn't seen.
        """
        db = get_database()
        if db is None:
            return []
        
        try:
            # Get current user ratings
            user_ratings = await db.ratings.find({"user_id": user_id}).to_list(500)
            if not user_ratings:
                return self.get_popularity_based(n)
            
            rated_ids = {r["movie_id"] for r in user_ratings}
            user_rating_map = {r["movie_id"]: r["rating"] for r in user_ratings}
            
            # Find other users who rated same movies
            pipeline = [
                {"$match": {"movie_id": {"$in": list(rated_ids)}, "user_id": {"$ne": user_id}}},
                {"$group": {"_id": "$user_id", "common_movies": {"$sum": 1}}},
                {"$sort": {"common_movies": -1}},
                {"$limit": 20}
            ]
            similar_users = await db.ratings.aggregate(pipeline).to_list(20)
            similar_user_ids = [u["_id"] for u in similar_users]
            
            if not similar_user_ids:
                return self.get_popularity_based(n)
            
            # Get movies highly rated by similar users that current user hasn't seen
            pipeline2 = [
                {"$match": {"user_id": {"$in": similar_user_ids}, "movie_id": {"$nin": list(rated_ids)}, "rating": {"$gte": 3.5}}},
                {"$group": {"_id": "$movie_id", "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}},
                {"$sort": {"avg_rating": -1, "count": -1}},
                {"$limit": n * 2}
            ]
            collab_movies = await db.ratings.aggregate(pipeline2).to_list(n * 2)
            
            results = []
            for cm in collab_movies:
                movie_id = cm["_id"]
                movie = next((m for m in self._movie_cache if m.get("tmdb_id") == movie_id), None)
                if movie:
                    m = movie.copy()
                    m.pop("box_office_tier", None)
                    m.pop("internal_score", None)
                    results.append(m)
                if len(results) >= n:
                    break
            
            return results
        except Exception as e:
            print(f"Collaborative filtering error: {e}")
            return self.get_popularity_based(n)
    
    def get_popularity_based(self, n: int = 20) -> List[dict]:
        """Rank movies by internal weighted score (popularity + rating + hidden box office)."""
        if not self._movie_cache:
            return []
        
        scored = []
        for movie in self._movie_cache:
            m = movie.copy()
            # Use internal score for ranking but don't expose it
            internal = m.pop("internal_score", self._compute_internal_score(m))
            m.pop("box_office_tier", None)
            scored.append((internal, m))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [m for _, m in scored[:n]]
    
    def get_weighted_recommendations(
        self,
        genres: List[str],
        language: Optional[str] = None,
        n: int = 20
    ) -> List[dict]:
        """Weighted recommendation combining genre, language, and internal score."""
        if self._df is None:
            return []
        
        results = []
        for movie in self._movie_cache:
            score = 0.0
            
            # Genre match score
            movie_genres = set(movie.get("genres", []))
            genre_overlap = len(set(genres) & movie_genres) / max(len(genres), 1)
            score += genre_overlap * 0.5
            
            # Language match
            if language and movie.get("original_language") == language:
                score += 0.2
            
            # Internal score contribution (hidden)
            internal = self._compute_internal_score(movie)
            score += internal * 0.3
            
            m = movie.copy()
            m.pop("box_office_tier", None)
            m.pop("internal_score", None)
            m["_weighted_score"] = score
            results.append(m)
        
        results.sort(key=lambda x: x.pop("_weighted_score", 0), reverse=True)
        return results[:n]

# Global engine instance
engine = RecommendationEngine()
