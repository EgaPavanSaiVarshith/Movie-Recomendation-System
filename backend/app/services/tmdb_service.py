import httpx
from typing import List, Optional, Dict, Any
from app.core.config import settings

GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western"
}

LANGUAGE_MAP = {
    "te": "Telugu", "hi": "Hindi", "en": "English", "ta": "Tamil",
    "ml": "Malayalam", "ko": "Korean", "ja": "Japanese/Anime",
    "fr": "French", "es": "Spanish", "zh": "Chinese", "kn": "Kannada"
}

OTT_PROVIDER_MAP = {
    8: "Netflix", 9: "Amazon Prime", 337: "Disney+", 15: "Hulu",
    350: "Apple TV+", 2: "Apple iTunes", 3: "Google Play",
    192: "YouTube", 11: "MUBI", 384: "HBO Max"
}

async def fetch_tmdb(endpoint: str, params: dict = {}) -> dict:
    async with httpx.AsyncClient() as client:
        params["api_key"] = settings.TMDB_API_KEY
        response = await client.get(
            f"{settings.TMDB_BASE_URL}{endpoint}",
            params=params,
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()

def get_genre_names(genre_ids: List[int]) -> List[str]:
    return [GENRE_MAP.get(gid, "Unknown") for gid in genre_ids]

def get_language_name(code: str) -> str:
    return LANGUAGE_MAP.get(code, code.upper())

def get_image_url(path: Optional[str], size: str = "w500") -> Optional[str]:
    if not path:
        return None
    # Use weserv.nl to bypass TMDB image blocking in certain regions (like India)
    return f"https://images.weserv.nl/?url=image.tmdb.org/t/p/{size}{path}"

def format_movie(raw: dict) -> dict:
    genre_ids = raw.get("genre_ids", [])
    genres_list = raw.get("genres", [])
    if genres_list:
        genres = [g["name"] for g in genres_list]
    else:
        genres = get_genre_names(genre_ids)
    
    return {
        "tmdb_id": raw.get("id"),
        "title": raw.get("title", raw.get("name", "")),
        "original_title": raw.get("original_title"),
        "overview": raw.get("overview"),
        "poster_path": get_image_url(raw.get("poster_path")),
        "backdrop_path": get_image_url(raw.get("backdrop_path"), "original"),
        "release_date": raw.get("release_date", raw.get("first_air_date", "")),
        "vote_average": round(raw.get("vote_average", 0), 1),
        "vote_count": raw.get("vote_count", 0),
        "genres": genres,
        "language": get_language_name(raw.get("original_language", "")),
        "original_language": raw.get("original_language"),
        "popularity": raw.get("popularity", 0),
        "runtime": raw.get("runtime"),
        "cast": [],
        "trailer_key": None,
        "ott_platforms": [],
    }

async def get_movie_details(movie_id: int) -> dict:
    try:
        raw = await fetch_tmdb(f"/movie/{movie_id}", {"append_to_response": "credits,videos,watch/providers"})
        movie = format_movie(raw)
        
        # Extract cast (top 10)
        credits = raw.get("credits", {})
        cast = credits.get("cast", [])[:10]
        movie["cast"] = [
            {
                "id": c.get("id"),
                "name": c.get("name"),
                "character": c.get("character"),
                "profile_path": get_image_url(c.get("profile_path"), "w185")
            }
            for c in cast
        ]
        
        # Extract trailer
        videos = raw.get("videos", {}).get("results", [])
        trailers = [v for v in videos if v.get("type") == "Trailer" and v.get("site") == "YouTube"]
        if trailers:
            movie["trailer_key"] = trailers[0].get("key")
        
        # Extract OTT platforms (US region)
        providers_data = raw.get("watch/providers", {}).get("results", {})
        us_providers = providers_data.get("US", {}).get("flatrate", [])
        movie["ott_platforms"] = [
            OTT_PROVIDER_MAP.get(p.get("provider_id"), p.get("provider_name"))
            for p in us_providers
        ]
        
        return movie
    except Exception as e:
        print(f"Error fetching movie {movie_id}: {e}")
        return None

async def search_movies(query: str, page: int = 1) -> List[dict]:
    try:
        data = await fetch_tmdb("/search/movie", {"query": query, "page": page, "include_adult": False})
        return [format_movie(m) for m in data.get("results", [])]
    except Exception as e:
        print(f"Search error: {e}")
        return []

async def get_trending_movies(period: str = "week") -> List[dict]:
    try:
        data = await fetch_tmdb(f"/trending/movie/{period}")
        return [format_movie(m) for m in data.get("results", [])]
    except Exception as e:
        print(f"Trending error: {e}")
        return []

async def get_movies_by_language(language_code: str, page: int = 1) -> List[dict]:
    try:
        data = await fetch_tmdb("/discover/movie", {
            "with_original_language": language_code,
            "sort_by": "popularity.desc",
            "page": page,
            "vote_count.gte": 100
        })
        return [format_movie(m) for m in data.get("results", [])]
    except Exception as e:
        print(f"Language fetch error: {e}")
        return []

async def get_similar_movies(movie_id: int) -> List[dict]:
    try:
        data = await fetch_tmdb(f"/movie/{movie_id}/similar")
        return [format_movie(m) for m in data.get("results", [])[:12]]
    except Exception as e:
        print(f"Similar movies error: {e}")
        return []

async def get_popular_movies(page: int = 1) -> List[dict]:
    try:
        data = await fetch_tmdb("/movie/popular", {"page": page})
        return [format_movie(m) for m in data.get("results", [])]
    except Exception as e:
        print(f"Popular movies error: {e}")
        return []

async def get_top_rated_movies(page: int = 1) -> List[dict]:
    try:
        data = await fetch_tmdb("/movie/top_rated", {"page": page})
        return [format_movie(m) for m in data.get("results", [])]
    except Exception as e:
        print(f"Top rated error: {e}")
        return []

async def get_now_playing_movies(page: int = 1) -> List[dict]:
    try:
        data = await fetch_tmdb("/movie/now_playing", {"page": page})
        return [format_movie(m) for m in data.get("results", [])]
    except Exception as e:
        print(f"Now playing error: {e}")
        return []
