import React, { useEffect, useState } from 'react'
import { watchlistAPI } from '../api/client'
import MovieCard from '../components/MovieCard'
import { Bookmark, BookmarkX } from 'lucide-react'
import { useAuthStore } from '../store'
import { Link } from 'react-router-dom'

export default function WatchlistPage() {
  const { isAuthenticated } = useAuthStore()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await watchlistAPI.get()
        setMovies(res.data.movies || [])
      } catch { setMovies([]) }
      setLoading(false)
    }
    fetch()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cinema-bg flex items-center justify-center pt-20">
        <div className="text-center glass rounded-3xl p-12">
          <Bookmark size={60} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Your Watchlist</h2>
          <p className="text-zinc-400 mb-6">Sign in to create and manage your watchlist</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cinema-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-1">My Watchlist</h1>
            <p className="text-zinc-400">{movies.length} movie{movies.length !== 1 ? 's' : ''} saved</p>
          </div>
          <Bookmark size={28} className="text-red-500" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => <div key={i}><div className="aspect-[2/3] shimmer rounded-2xl" /></div>)}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24">
            <BookmarkX size={64} className="mx-auto text-zinc-700 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Nothing saved yet</h2>
            <p className="text-zinc-400 mb-6">Browse movies and add them to your watchlist</p>
            <Link to="/" className="btn-primary">Explore Movies</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie, i) => <MovieCard key={movie.tmdb_id} movie={movie} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
