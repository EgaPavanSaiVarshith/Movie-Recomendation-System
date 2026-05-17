from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.database import get_database
from app.services.tmdb_service import get_movie_details

router = APIRouter()

@router.get("")
async def get_watchlist(current_user: dict = Depends(get_current_user)):
    watchlist_ids = current_user.get("watchlist", [])
    movies = []
    for mid in watchlist_ids:
        movie = await get_movie_details(mid)
        if movie:
            movies.append(movie)
    return {"movies": movies, "total": len(movies)}

@router.post("/{movie_id}")
async def add_to_watchlist(movie_id: int, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    watchlist = current_user.get("watchlist", [])
    if movie_id in watchlist:
        return {"message": "Already in watchlist", "in_watchlist": True}
    await db.users.update_one({"_id": user_id}, {"$addToSet": {"watchlist": movie_id}})
    return {"message": "Added to watchlist", "in_watchlist": True, "movie_id": movie_id}

@router.delete("/{movie_id}")
async def remove_from_watchlist(movie_id: int, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    await db.users.update_one({"_id": user_id}, {"$pull": {"watchlist": movie_id}})
    return {"message": "Removed from watchlist", "in_watchlist": False, "movie_id": movie_id}

@router.get("/check/{movie_id}")
async def check_watchlist(movie_id: int, current_user: dict = Depends(get_current_user)):
    watchlist = current_user.get("watchlist", [])
    return {"in_watchlist": movie_id in watchlist, "movie_id": movie_id}
