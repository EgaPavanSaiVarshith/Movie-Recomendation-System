import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Star, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore, useWatchlistStore } from '../store'
import { watchlistAPI, getProxyImageUrl } from '../api/client'
import toast from 'react-hot-toast'

export default function MovieCard({ movie, index = 0, size = 'normal' }) {
  const { isAuthenticated } = useAuthStore()
  const { isInWatchlist, addId, removeId } = useWatchlistStore()
  const navigate = useNavigate()
  const inWatchlist = isInWatchlist(movie.tmdb_id)

  const toggleWatchlist = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) { toast.error('Sign in to use watchlist'); return }
    try {
      if (inWatchlist) {
        await watchlistAPI.remove(movie.tmdb_id)
        removeId(movie.tmdb_id)
        toast.success('Removed from watchlist')
      } else {
        await watchlistAPI.add(movie.tmdb_id)
        addId(movie.tmdb_id)
        toast.success('Added to watchlist')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const poster = movie.poster_path ? getProxyImageUrl(movie.poster_path) : `https://via.placeholder.com/300x450/1a1a2e/666?text=${encodeURIComponent(movie.title)}`
  const rating = movie.vote_average || 0
  const year = movie.release_date?.slice(0, 4) || ''
  const genres = movie.genres?.slice(0, 2) || []

  const isSmall = size === 'small'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.4 }}
      className="movie-card group"
      onClick={() => navigate(`/movie/${movie.tmdb_id}`)}
    >
      {/* Poster */}
      <div className={`relative overflow-hidden rounded-2xl ${isSmall ? 'aspect-[2/3]' : 'aspect-[2/3]'} bg-zinc-900`}>
        <img
          src={poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={e => { e.target.src = `https://via.placeholder.com/300x450/1a1a2e/666?text=${encodeURIComponent(movie.title)}` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
            </div>
          )}
          <button
            onClick={toggleWatchlist}
            className={`ml-auto p-1.5 rounded-lg backdrop-blur-sm transition-all duration-200 ${inWatchlist ? 'bg-red-500/90 text-white' : 'bg-black/70 text-zinc-400 hover:text-white'}`}
          >
            {inWatchlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play size={20} className="text-white fill-white ml-1" />
          </div>
        </div>

        {/* Language badge */}
        {movie.language && (
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs bg-red-600/90 text-white px-2 py-0.5 rounded-md font-medium">
              {movie.language}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 px-1">
        <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-red-400 transition-colors">{movie.title}</h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {year && <span className="text-xs text-zinc-500">{year}</span>}
          {genres.map(g => (
            <span key={g} className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{g}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
