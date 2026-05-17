import React, { useEffect, useState } from 'react'
import { moviesAPI } from '../api/client'
import MovieCard from '../components/MovieCard'
import { TrendingUp, Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrendingPage() {
  const [period, setPeriod] = useState('week')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await moviesAPI.trending(period)
        setMovies(res.data.movies || [])
      } catch { setMovies([]) }
      setLoading(false)
    }
    fetch()
  }, [period])

  return (
    <div className="min-h-screen bg-cinema-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium mb-3">
              <TrendingUp size={14} className="animate-bounce" /> Live Trending
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">What's Hot 🔥</h1>
          </div>

          {/* Period toggle */}
          <div className="flex gap-2">
            {[{ val: 'day', label: 'Today', icon: Clock }, { val: 'week', label: 'This Week', icon: Calendar }].map(({ val, label, icon: Icon }) => (
              <button key={val} onClick={() => setPeriod(val)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${period === val ? 'bg-red-600 text-white' : 'glass text-zinc-400 hover:text-white border border-white/10'}`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[2/3] shimmer rounded-2xl" />
                <div className="h-4 shimmer rounded mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie, i) => (
              <div key={movie.tmdb_id} className="relative">
                <div className="absolute -top-3 -left-1 z-10 w-8 h-8 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <MovieCard movie={movie} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
