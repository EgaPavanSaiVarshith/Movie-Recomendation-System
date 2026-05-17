import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Info, ChevronLeft, ChevronRight, Star, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { moviesAPI, recsAPI, getProxyImageUrl } from '../api/client'
import { useAuthStore } from '../store'
import MovieRow from '../components/MovieRow'

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy', mood: 'happy' },
  { emoji: '😢', label: 'Sad', mood: 'sad' },
  { emoji: '🔥', label: 'Excited', mood: 'excited' },
  { emoji: '😱', label: 'Scared', mood: 'scared' },
  { emoji: '💕', label: 'Romantic', mood: 'romantic' },
  { emoji: '🌍', label: 'Adventurous', mood: 'adventurous' },
  { emoji: '🤔', label: 'Thoughtful', mood: 'thoughtful' },
  { emoji: '😌', label: 'Relaxed', mood: 'relaxed' },
]

const LANGUAGES = [
  { code: 'telugu', label: 'Telugu', flag: '🌟' },
  { code: 'hindi', label: 'Hindi', flag: '🎭' },
  { code: 'english', label: 'English', flag: '🎬' },
  { code: 'tamil', label: 'Tamil', flag: '🏛️' },
  { code: 'malayalam', label: 'Malayalam', flag: '🌴' },
  { code: 'korean', label: 'Korean', flag: '🇰🇷' },
  { code: 'anime', label: 'Anime', flag: '⚡' },
]

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [heroMovies, setHeroMovies] = useState([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [trending, setTrending] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [popular, setPopular] = useState([])
  const [topRated, setTopRated] = useState([])
  const [teluguMovies, setTeluguMovies] = useState([])
  const [moodMovies, setMoodMovies] = useState([])
  const [selectedMood, setSelectedMood] = useState(null)
  const [activeLang, setActiveLang] = useState(null)
  const [langMovies, setLangMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [langLoading, setLangLoading] = useState(false)
  const [moodLoading, setMoodLoading] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [trendRes, nowPlayRes, popRes, topRes, teluguRes] = await Promise.all([
          moviesAPI.trending('week'),
          moviesAPI.nowPlaying(),
          moviesAPI.popular(),
          moviesAPI.topRated(),
          moviesAPI.byLanguage('telugu'),
        ])
        const trendMovies = trendRes.data.movies || []
        setTrending(trendMovies)
        setHeroMovies(trendMovies.slice(0, 5))
        setNowPlaying(nowPlayRes.data.movies || [])
        setPopular(popRes.data.movies || [])
        setTopRated(topRes.data.movies || [])
        setTeluguMovies(teluguRes.data.movies || [])
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Auto-advance hero
  useEffect(() => {
    if (!heroMovies.length) return
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroMovies.length), 6000)
    return () => clearInterval(t)
  }, [heroMovies])

  const handleMood = async (mood) => {
    setSelectedMood(mood)
    setMoodLoading(true)
    try {
      const res = await recsAPI.mood(mood)
      setMoodMovies(res.data.movies || [])
    } catch { setMoodMovies([]) }
    setMoodLoading(false)
  }

  const handleLang = async (lang) => {
    if (activeLang === lang) { setActiveLang(null); setLangMovies([]); return }
    setActiveLang(lang)
    setLangLoading(true)
    try {
      const res = await moviesAPI.byLanguage(lang)
      setLangMovies(res.data.movies || [])
    } catch { setLangMovies([]) }
    setLangLoading(false)
  }

  const hero = heroMovies[heroIndex]

  return (
    <div className="min-h-screen bg-cinema-bg">
      {/* Hero Section */}
      <div className="relative h-[80vh] md:h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {hero && (
            <motion.div
              key={hero.tmdb_id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img
                src={getProxyImageUrl(hero.backdrop_path || hero.poster_path)}
                alt={hero.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 hero-overlay" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero content */}
        {hero && (
          <div className="absolute inset-0 flex items-end md:items-center pb-24 md:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                key={hero.tmdb_id + '_content'}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl"
              >
                {/* Trending badge */}
                <div className="inline-flex items-center gap-2 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  #{heroIndex + 1} Trending This Week
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight drop-shadow-2xl">
                  {hero.title}
                </h1>

                <div className="flex items-center gap-4 mb-4">
                  {hero.vote_average > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                      <span className="text-amber-400 font-bold">{hero.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  {hero.release_date && <span className="text-zinc-400 text-sm">{hero.release_date.slice(0, 4)}</span>}
                  {hero.language && <span className="text-zinc-400 text-sm">{hero.language}</span>}
                  {hero.genres?.slice(0, 3).map(g => (
                    <span key={g} className="genre-badge">{g}</span>
                  ))}
                </div>

                <p className="text-zinc-300 text-sm md:text-base line-clamp-3 mb-6 max-w-lg leading-relaxed">
                  {hero.overview}
                </p>

                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(`/movie/${hero.tmdb_id}`)}
                    className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                  >
                    <Play size={18} className="fill-black" /> Watch Now
                  </button>
                  <button onClick={() => navigate(`/movie/${hero.tmdb_id}`)}
                    className="flex items-center gap-2 glass hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-white/20 active:scale-95"
                  >
                    <Info size={18} /> More Info
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Hero navigation dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroMovies.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)}
              className={`transition-all duration-300 rounded-full ${i === heroIndex ? 'w-6 h-2 bg-red-500' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>

        {/* Side arrows */}
        <button onClick={() => setHeroIndex(i => (i - 1 + heroMovies.length) % heroMovies.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass rounded-xl hover:bg-white/15 transition-all hidden md:flex">
          <ChevronLeft size={22} className="text-white" />
        </button>
        <button onClick={() => setHeroIndex(i => (i + 1) % heroMovies.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass rounded-xl hover:bg-white/15 transition-all hidden md:flex">
          <ChevronRight size={22} className="text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">

        {/* Mood picker */}
        <section className="mb-10">
          <h2 className="section-title">What's Your Mood?</h2>
          <div className="flex flex-wrap gap-3">
            {MOOD_OPTIONS.map(({ emoji, label, mood }) => (
              <button key={mood} onClick={() => handleMood(mood)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 active:scale-95 ${selectedMood === mood
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'glass hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10'
                }`}
              >
                <span className="text-lg">{emoji}</span> {label}
              </button>
            ))}
          </div>
        </section>

        {/* Mood results */}
        {(selectedMood || moodLoading) && (
          <MovieRow
            title={`${MOOD_OPTIONS.find(m => m.mood === selectedMood)?.emoji || ''} ${selectedMood ? selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1) : ''} Picks`}
            movies={moodMovies}
            loading={moodLoading}
          />
        )}

        {/* Trending */}
        <MovieRow title="🔥 Trending This Week" movies={trending} loading={loading} badge="LIVE" />

        {/* Dedicated Telugu row */}
        <MovieRow title="🌟 Superhit Telugu Movies" movies={teluguMovies} loading={loading} badge="TOLLYWOOD" />

        {/* Now Playing */}
        <MovieRow title="🎬 New Releases In Theaters" movies={nowPlaying} loading={loading} badge="NEW" />

        {/* Language selector */}
        <section className="mb-10">
          <h2 className="section-title">Browse by Language</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {LANGUAGES.map(({ code, label, flag }) => (
              <button key={code} onClick={() => handleLang(code)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 active:scale-95 ${activeLang === code
                  ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/40'
                  : 'glass hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10'
                }`}
              >
                <span>{flag}</span> {label}
              </button>
            ))}
          </div>
          {(activeLang || langLoading) && (
            <MovieRow
              title={`${LANGUAGES.find(l => l.code === activeLang)?.flag || ''} ${activeLang ? activeLang.charAt(0).toUpperCase() + activeLang.slice(1) : ''} Movies`}
              movies={langMovies}
              loading={langLoading}
            />
          )}
        </section>

        {/* Popular */}
        <MovieRow title="🌟 Popular on CineAI" movies={popular} loading={loading} />

        {/* Top Rated */}
        <MovieRow title="⭐ Top Rated All Time" movies={topRated} loading={loading} />

        {/* CTA */}
        {!isAuthenticated && (
          <section className="py-16 text-center">
            <div className="glass rounded-3xl p-10 max-w-2xl mx-auto border border-white/10">
              <div className="text-5xl mb-4">🎬</div>
              <h2 className="text-3xl font-black text-white mb-3">Unlock Personalized Picks</h2>
              <p className="text-zinc-400 mb-6">Sign up for free to get AI-powered recommendations tailored to your taste.</p>
              <div className="flex items-center justify-center gap-4">
                <a href="/register" className="btn-primary">Get Started Free</a>
                <a href="/login" className="btn-secondary">Sign In</a>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
