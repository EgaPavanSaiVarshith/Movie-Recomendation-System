from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class MovieBase(BaseModel):
    tmdb_id: int
    title: str
    original_title: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None
    genres: List[str] = []
    language: Optional[str] = None
    original_language: Optional[str] = None
    popularity: Optional[float] = None
    runtime: Optional[int] = None
    cast: List[dict] = []
    crew: List[dict] = []
    trailer_key: Optional[str] = None
    ott_platforms: List[str] = []
    # Hidden internal field - never exposed in public API
    _box_office_score: Optional[float] = None

class MovieResponse(BaseModel):
    tmdb_id: int
    title: str
    original_title: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None
    genres: List[str] = []
    language: Optional[str] = None
    original_language: Optional[str] = None
    popularity: Optional[float] = None
    runtime: Optional[int] = None
    cast: List[dict] = []
    trailer_key: Optional[str] = None
    ott_platforms: List[str] = []

class MovieSearchResult(BaseModel):
    tmdb_id: int
    title: str
    poster_path: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    genres: List[str] = []
    language: Optional[str] = None

class RecommendationResponse(BaseModel):
    movies: List[MovieResponse]
    recommendation_type: str
    total: int

class TrendingResponse(BaseModel):
    movies: List[MovieResponse]
    period: str
    total: int
