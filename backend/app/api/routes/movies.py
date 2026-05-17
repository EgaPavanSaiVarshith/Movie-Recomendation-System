from fastapi import APIRouter, Query, HTTPException, Depends, Response
from typing import Optional, List
import httpx
from app.services.tmdb_service import (
    search_movies, get_movie_details, get_trending_movies,
    get_movies_by_language, get_popular_movies, get_top_rated_movies,
    get_similar_movies, get_now_playing_movies
)
from app.core.database import get_database
from app.core.security import get_current_user

router = APIRouter()

SUPPORTED_LANGUAGES = {
    "telugu": "te", "hindi": "hi", "english": "en", "tamil": "ta",
    "malayalam": "ml", "korean": "ko", "japanese": "ja", "anime": "ja",
    "french": "fr", "spanish": "es", "chinese": "zh", "kannada": "kn"
}

@router.get("/search")
async def search(q: str = Query(..., min_length=1), page: int = 1):
    results = await search_movies(q, page)
    return {"results": results, "query": q, "page": page, "total": len(results)}

@router.get("/trending")
async def trending(period: str = "week"):
    if period not in ["day", "week"]:
        period = "week"
    movies = await get_trending_movies(period)
    return {"movies": movies, "period": period, "total": len(movies)}

@router.get("/popular")
async def popular(page: int = 1):
    movies = await get_popular_movies(page)
    return {"movies": movies, "page": page}

@router.get("/top-rated")
async def top_rated(page: int = 1):
    movies = await get_top_rated_movies(page)
    return {"movies": movies, "page": page}

@router.get("/now-playing")
async def now_playing(page: int = 1):
    movies = await get_now_playing_movies(page)
    return {"movies": movies, "page": page}

@router.get("/proxy-image")
async def proxy_image(url: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                return Response(content=response.content, media_type=response.headers.get("content-type", "image/jpeg"))
            else:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-language/{language}")
async def by_language(language: str, page: int = 1):
    lang_code = SUPPORTED_LANGUAGES.get(language.lower())
    if not lang_code:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")
    movies = await get_movies_by_language(lang_code, page)
    return {"movies": movies, "language": language, "page": page}

@router.get("/{movie_id}")
async def movie_detail(movie_id: int):
    movie = await get_movie_details(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.get("/{movie_id}/similar")
async def similar(movie_id: int):
    movies = await get_similar_movies(movie_id)
    return {"movies": movies, "movie_id": movie_id}

@router.post("/{movie_id}/rate")
async def rate_movie(movie_id: int, rating: float, review: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if not 0.5 <= rating <= 5.0:
        raise HTTPException(status_code=400, detail="Rating must be between 0.5 and 5.0")
    
    db = get_database()
    from datetime import datetime
    user_id = str(current_user["_id"])
    
    await db.ratings.update_one(
        {"user_id": user_id, "movie_id": movie_id},
        {"$set": {"rating": rating, "review": review, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    return {"message": "Rating saved", "movie_id": movie_id, "rating": rating}

@router.get("/{movie_id}/my-rating")
async def my_rating(movie_id: int, current_user: dict = Depends(get_current_user)):
    db = get_database()
    rating = await db.ratings.find_one({"user_id": str(current_user["_id"]), "movie_id": movie_id})
    if rating:
        return {"rating": rating.get("rating"), "review": rating.get("review")}
    return {"rating": None, "review": None}
