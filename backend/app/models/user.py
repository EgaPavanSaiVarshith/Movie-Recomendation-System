from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    preferred_languages: List[str] = []
    preferred_genres: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResetPassword(BaseModel):
    email: EmailStr
    username: str
    new_password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_languages: List[str] = []
    preferred_genres: List[str] = []
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_languages: Optional[List[str]] = None
    preferred_genres: Optional[List[str]] = None

class RatingCreate(BaseModel):
    movie_id: int
    rating: float = Field(..., ge=0.5, le=5.0)
    review: Optional[str] = None
