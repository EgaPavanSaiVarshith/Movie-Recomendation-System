from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from app.core.security import get_current_user
from app.services.tmdb_service import (
    get_trending_movies, get_popular_movies, get_movie_details,
    get_movies_by_language, search_movies
)
from app.ml.recommendation_engine import engine

router = APIRouter()

@router.get("/personalized")
async def personalized(n: int = 20, current_user: dict = Depends(get_current_user)):
    """Personalized recommendations based on user preferences + collaborative filtering."""
    user_id = str(current_user["_id"])
    preferred_genres = current_user.get("preferred_genres", [])
    preferred_languages = current_user.get("preferred_languages", [])

    # Try collaborative first, fall back to weighted
    collab = await engine.get_collaborative(user_id, n)

    if len(collab) >= 10:
        return {"movies": collab, "type": "collaborative", "total": len(collab)}

    # Blend: weighted by genre + language preference
    lang_code = None
    if preferred_languages:
        lang_map = {"Telugu": "te", "Hindi": "hi", "English": "en", "Tamil": "ta",
                    "Malayalam": "ml", "Korean": "ko"}
        lang_code = lang_map.get(preferred_languages[0])

    weighted = engine.get_weighted_recommendations(
        genres=preferred_genres or ["Action", "Drama", "Comedy"],
        language=lang_code,
        n=n
    )
    return {"movies": weighted, "type": "weighted", "total": len(weighted)}

@router.get("/similar/{movie_id}")
async def similar_to(movie_id: int, n: int = 12):
    """Content-based similar movies using cosine similarity."""
    results = engine.get_content_based(movie_id, n)
    if not results:
        from app.services.tmdb_service import get_similar_movies
        results = await get_similar_movies(movie_id)
    return {"movies": results, "movie_id": movie_id, "total": len(results)}

@router.get("/by-genre")
async def by_genre(genres: str = Query(...), n: int = 20):
    """Recommend movies by genre list (comma-separated)."""
    genre_list = [g.strip() for g in genres.split(",") if g.strip()]
    results = engine.get_genre_based(genre_list, n)
    return {"movies": results, "genres": genre_list, "total": len(results)}

@router.get("/mood/{mood}")
async def mood_based(mood: str, n: int = 20):
    """Mood-based recommendations."""
    valid_moods = ["happy", "sad", "excited", "scared", "thoughtful", "romantic", "adventurous", "relaxed"]
    if mood.lower() not in valid_moods:
        mood = "happy"
    results = engine.get_mood_based(mood, n)
    return {"movies": results, "mood": mood, "total": len(results), "valid_moods": valid_moods}

@router.get("/trending")
async def trending_recs(period: str = "week"):
    movies = await get_trending_movies(period)
    return {"movies": movies, "period": period, "total": len(movies)}

@router.get("/popular")
async def popularity_recs(n: int = 20):
    """Internal-score-weighted popularity recommendations."""
    results = engine.get_popularity_based(n)
    return {"movies": results, "total": len(results)}

@router.get("/by-language/{language}")
async def language_recs(language: str, n: int = 20):
    lang_map = {
        "telugu": "te", "hindi": "hi", "english": "en", "tamil": "ta",
        "malayalam": "ml", "korean": "ko", "anime": "ja", "japanese": "ja"
    }
    code = lang_map.get(language.lower(), "en")
    movies = await get_movies_by_language(code)
    return {"movies": movies[:n], "language": language, "total": len(movies[:n])}

@router.post("/load-engine")
async def load_engine(n_pages: int = 3):
    """Pre-load the recommendation engine with popular movies."""
    all_movies = []
    for page in range(1, n_pages + 1):
        page_movies = await get_popular_movies(page)
        all_movies.extend(page_movies)
    await engine.load_movies(all_movies)
    return {"message": f"Engine loaded with {len(all_movies)} movies", "total": len(all_movies)}
