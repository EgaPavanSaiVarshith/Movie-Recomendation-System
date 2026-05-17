from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from bson import ObjectId

from app.core.database import get_database
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user
)
from app.core.config import settings
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse

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

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    db = get_database()
    
    # Check existing user
    existing = await db.users.find_one({"$or": [{"email": user_data.email}, {"username": user_data.username}]})
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already registered")
    
    from datetime import datetime
    new_user = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "avatar_url": None,
        "preferred_languages": [],
        "preferred_genres": [],
        "watchlist": [],
        "created_at": datetime.utcnow(),
    }
    
    result = await db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    
    token = create_access_token({"sub": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer", "user": serialize_user(new_user)}

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": user_data.email})
    
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
