from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import re

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[dict]] = []

MOVIE_KEYWORDS = {
    "recommend": ["recommend", "suggest", "show me", "what to watch", "any good"],
    "genre": ["action", "comedy", "drama", "horror", "thriller", "romance", "sci-fi", "animation"],
    "mood": ["happy", "sad", "excited", "scared", "relaxed", "romantic", "adventurous"],
    "language": ["telugu", "hindi", "english", "tamil", "malayalam", "korean", "anime", "japanese"],
    "rating": ["rated", "rating", "imdb", "score"],
    "trending": ["trending", "popular", "top", "best", "latest", "new"],
    "actor": ["actor", "actress", "starring", "cast", "who is in"],
}

RESPONSES = {
    "greeting": "🎬 Hey there! I'm CineAI, your personal movie guide. Ask me for recommendations, movie info, or just tell me your mood!",
    "action": "🔥 Love action movies? Check out **John Wick**, **Mad Max: Fury Road**, or **RRR** (Telugu epic). Want more specific picks?",
    "comedy": "😂 In the mood for laughs? Try **Ala Vaikunthapurramuloo** (Telugu), **Munna Michael** (Hindi), or **Knives Out** (English). What language do you prefer?",
    "horror": "😱 Horror fan? **Get Out**, **The Conjuring**, **Tumbbad** (Hindi) are must-watches! Want jump-scare or psychological horror?",
    "romance": "💕 Looking for romance? **Arjun Reddy** (Telugu), **Ae Dil Hai Mushkil** (Hindi), **Parasite** (Korean), or **La La Land** (English) are gems!",
    "telugu": "🌟 Telugu movies are amazing! Check out **RRR**, **Pushpa**, **Baahubali**, **Ala Vaikunthapurramuloo**, or **Arjun Reddy**!",
    "hindi": "🎭 Great Hindi movies: **Dangal**, **3 Idiots**, **Gully Boy**, **Sacred Games**, or **Tumbbad**!",
    "korean": "🇰🇷 Korean cinema is incredible! Start with **Parasite**, **Oldboy**, **Train to Busan**, **Squid Game**, or **Money Heist: Korea**!",
    "anime": "⚡ Anime movies? **Spirited Away**, **Your Name**, **Akira**, **Demon Slayer** are legendary! Into action or emotional stories?",
    "happy": "😊 Feeling happy? Watch **Ala Vaikunthapurramuloo**, **Minions**, **The Grand Budapest Hotel**, or **Chef**!",
    "sad": "💙 Feeling blue? A good movie helps. Try **Taare Zameen Par** (Hindi), **Inside Out**, or **The Shawshank Redemption**.",
    "trending": "📈 Currently trending worldwide: **Dune: Part Two**, **Oppenheimer**, **Jawan** (Hindi), and **Leo** (Tamil)! Want details?",
    "default": "🎬 I can help you find the perfect movie! Tell me:\n• Your **mood** (happy, excited, sad...)\n• A **genre** (action, comedy, horror...)\n• A **language** (Telugu, Hindi, Korean...)\n• Or ask about **trending** movies!",
}

def get_bot_response(message: str) -> dict:
    msg_lower = message.lower()

    # Greeting
    if any(w in msg_lower for w in ["hi", "hello", "hey", "hola", "namaste"]):
        return {"reply": RESPONSES["greeting"], "suggestions": ["Recommend a movie", "Telugu movies", "Trending now", "I'm feeling happy"]}

    # Mood detection
    for mood in ["happy", "sad", "excited", "scared", "relaxed", "romantic", "adventurous"]:
        if mood in msg_lower:
            if mood == "happy":
                return {"reply": RESPONSES["happy"], "suggestions": ["More comedy movies", "Telugu comedies", "English comedies"]}
            if mood == "sad":
                return {"reply": RESPONSES["sad"], "suggestions": ["More drama movies", "Hindi dramas", "Feel-good movies"]}
            return {"reply": RESPONSES.get(mood, RESPONSES["default"]), "suggestions": ["Tell me more", "Different mood", "Trending movies"]}

    # Language detection
    for lang in ["telugu", "hindi", "korean", "anime", "tamil", "malayalam"]:
        if lang in msg_lower:
            return {"reply": RESPONSES.get(lang, RESPONSES["default"]), "suggestions": [f"More {lang.title()} movies", "Trending", "By genre"]}

    # Genre detection
    for genre in ["action", "comedy", "horror", "romance", "thriller", "drama", "sci-fi", "animation"]:
        if genre in msg_lower:
            return {"reply": RESPONSES.get(genre, RESPONSES["default"]), "suggestions": [f"More {genre}", "Different genre", "Top rated"]}

    # Trending
    if any(w in msg_lower for w in ["trending", "popular", "top", "best", "latest"]):
        return {"reply": RESPONSES["trending"], "suggestions": ["Action trending", "Korean trending", "Telugu trending"]}

    return {"reply": RESPONSES["default"], "suggestions": ["Telugu movies", "Mood-based", "Action movies", "Trending now"]}

@router.post("")
async def chat(body: ChatMessage):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    response = get_bot_response(body.message)
    return response
