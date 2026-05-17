from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.database import get_database
from app.models.user import UserUpdate

router = APIRouter()

def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "full_name": user.get("full_name"),
        "avatar_url": user.get("avatar_url"),
        "preferred_languages": user.get("preferred_languages", []),
        "preferred_genres": user.get("preferred_genres", []),
        "created_at": user["created_at"],
    }

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    db = get_database()
    rating_count = await db.ratings.count_documents({"user_id": str(current_user["_id"])})
    watchlist_count = len(current_user.get("watchlist", []))
    profile = serialize_user(current_user)
    profile["stats"] = {"ratings": rating_count, "watchlist": watchlist_count}
    return profile

@router.put("/profile")
async def update_profile(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        return serialize_user(current_user)
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_data})
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return serialize_user(updated)

@router.get("/ratings")
async def get_my_ratings(current_user: dict = Depends(get_current_user)):
    db = get_database()
    ratings = await db.ratings.find({"user_id": str(current_user["_id"])}).to_list(200)
    return {"ratings": [{"movie_id": r["movie_id"], "rating": r["rating"], "review": r.get("review")} for r in ratings]}
