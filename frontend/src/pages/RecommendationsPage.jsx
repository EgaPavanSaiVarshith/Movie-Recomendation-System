import React, { useEffect, useState } from 'react'
import { recsAPI } from '../api/client'
import { useAuthStore } from '../store'
import MovieRow from '../components/MovieRow'
import { Sparkles, TrendingUp, Globe, Zap } from 'lucide-react'

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy', mood: 'happy' },
  { emoji: '🔥', label: 'Excited', mood: 'excited' },
  { emoji: '💕', label: 'Romantic', mood: 'romantic' },
  { emoji: '😱', label: 'Scared', mood: 'scared' },
  { emoji: '😢', label: 'Sad', mood: 'sad' },
  { emoji: '🌍', label: 'Adventurous', mood: 'adventurous' },
  { emoji: '🤔', label: 'Thoughtful', mood: 'thoughtful' },
  { emoji: '😌', label: 'Relaxed', mood: 'relaxed' },
]

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Thriller', 'Romance', 'Sci-Fi', 'Animation', 'Documentary']

export default function RecommendationsPage() {
  const { isAuthenticated } = useAuthStore()
  const [personalized, setPersonalized] = useState([])
  const [trending, setTrending] = useState([])
  const [mood, setMood] = useState(null)
  const [moodMovies, setMoodMovies] = useState([])
  const [genre, setGenre] = useState(null)
  const [genreMovies, setGenreMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [moodLoading, setMoodLoading] = useState(false)
  const [genreLoading, setGenreLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const [trendRes] = await Promise.all([recsAPI.trending()])
      setTrending(trendRes.data.movies || [])
      if (isAuthenticated) {
        try {
          const recRes = await recsAPI.personalized()
          setPersonalized(recRes.data.movies || [])
        } catch { setPersonalized([]) }
      }
      setLoading(false)
    }
    fetch()
  }, [isAuthenticated])

  const handleMood = async (m) => {
    setMood(m)
    setMoodLoading(true)
    const res = await recsAPI.mood(m)
    setMoodMovies(res.data.movies || [])
    setMoodLoading(false)
  }

  const handleGenre = async (g) => {
    setGenre(g)
    setGenreLoading(true)
    const res = await recsAPI.byGenre([g])
    setGenreMovies(res.data.movies || [])
    setGenreLoading(false)
  }

  return (
    <div className="min-h-screen bg-cinema-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium mb-4">
            <Sparkles size={14} /> AI-Powered Recommendations
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Your Picks</h1>
          <p className="text-zinc-400 text-lg">Curated by our AI engine based on your taste.</p>
        </div>

        {/* Personalized (auth) */}
        {isAuthenticated && (
          <MovieRow title="✨ Personalized For You" movies={personalized} loading={loading} badge="AI" />
        )}

        {/* Mood picker */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={22} className="text-amber-400" />
            <h2 className="section-title mb-0">Pick Your Mood</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {MOOD_OPTIONS.map(({ emoji, label, mood: m }) => (
              <button key={m} onClick={() => handleMood(m)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95 ${mood === m ? 'bg-red-600 text-white shadow-lg' : 'glass hover:bg-white/10 text-zinc-300 border border-white/10'}`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </section>

        {(mood || moodLoading) && (
          <MovieRow title={`${MOOD_OPTIONS.find(x => x.mood === mood)?.emoji} ${mood} Picks`} movies={moodMovies} loading={moodLoading} />
        )}

        {/* Genre picker */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={22} className="text-purple-400" />
            <h2 className="section-title mb-0">Browse by Genre</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {GENRES.map(g => (
              <button key={g} onClick={() => handleGenre(g)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95 ${genre === g ? 'bg-purple-600 text-white' : 'glass hover:bg-white/10 text-zinc-300 border border-white/10'}`}
              >{g}</button>
            ))}
          </div>
        </section>

        {(genre || genreLoading) && (
          <MovieRow title={`🎭 ${genre} Movies`} movies={genreMovies} loading={genreLoading} />
        )}

        {/* Trending */}
        <MovieRow title="📈 Trending Now" movies={trending} loading={loading} badge="LIVE" />

        {!isAuthenticated && (
          <div className="mt-10 glass rounded-3xl p-8 text-center border border-white/10">
            <Sparkles size={40} className="mx-auto text-amber-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Get Personalized Recommendations</h2>
            <p className="text-zinc-400 mb-6">Sign up to unlock AI-powered picks tailored just for you.</p>
            <a href="/register" className="btn-primary">Create Free Account</a>
          </div>
        )}
      </div>
    </div>
  )
}
