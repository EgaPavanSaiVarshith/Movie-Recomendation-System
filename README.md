# 🎬 CineAI - AI-Powered Movie Recommendation System

A full-stack, production-ready movie recommendation platform supporting Telugu, Hindi, English, Tamil, Malayalam, Korean, Anime, and Hollywood movies.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS + Vite |
| Backend | Python FastAPI |
| Database | MongoDB |
| ML Engine | scikit-learn, Pandas, NumPy |
| Auth | JWT Tokens |
| Movie Data | TMDB API |

## 📁 Project Structure

```
Movie Recommendation System/
├── backend/
│   ├── app/
│   │   ├── api/           # Route handlers
│   │   ├── core/          # Config, security, DB
│   │   ├── models/        # Pydantic models
│   │   ├── services/      # Business logic
│   │   └── ml/            # Recommendation engine
│   ├── requirements.txt
│   └── main.py
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Page components
    │   ├── hooks/         # Custom React hooks
    │   ├── store/         # Zustand state management
    │   ├── api/           # API client
    │   └── utils/         # Helpers
    ├── package.json
    └── index.html
```

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)
- TMDB API Key (free at https://www.themoviedb.org/settings/api)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Fill in your API keys
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local   # Fill in backend URL
npm run dev
```

## 🔑 Environment Variables

### Backend `.env`
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=cineai
SECRET_KEY=your-secret-key-here
TMDB_API_KEY=your-tmdb-api-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Frontend `.env.local`
```
VITE_API_URL=http://localhost:8000
VITE_TMDB_API_KEY=your-tmdb-api-key
```

## 🌟 Features

- 🔍 Smart search with autocomplete
- 🤖 AI-powered recommendations (content + collaborative filtering)
- 🌍 Multi-language support (Telugu, Hindi, Tamil, Malayalam, Korean, Anime, English)
- 📊 Trending movies section
- 🎭 Mood-based recommendations
- 💬 AI chatbot movie assistant
- 📱 Fully responsive Netflix-like UI
- 🌙 Dark mode
- 🔐 JWT authentication
- 📋 Watchlist management
- ⭐ User ratings & reviews
- 🎬 OTT platform availability tags

## 🚀 Deployment

### Backend (Railway / Render)
```bash
# Set environment variables in your cloud provider
# Deploy using Dockerfile or direct Git integration
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the dist/ folder
```
