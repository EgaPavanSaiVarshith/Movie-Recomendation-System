import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Play, Bookmark, BookmarkCheck, Clock, Globe, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { moviesAPI, recsAPI, getProxyImageUrl } from '../api/client'
import { useAuthStore, useWatchlistStore } from '../store'
import { watchlistAPI } from '../api/client'
import MovieRow from '../components/MovieRow'
import toast from 'react-hot-toast'
import ReactPlayer from 'react-player'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { isInWatchlist, addId, removeId } = useWatchlistStore()
  const [movie, setMovie] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showTrailer, setShowTrailer] = useState(false)
  const [myRating, setMyRating] = useState(null)

  const inWatchlist = isInWatchlist(Number(id))

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchMovie = async () => {
      setLoading(true)
      setMovie(null)
      try {
        const [detailRes, simRes] = await Promise.all([
          moviesAPI.details(id),
          recsAPI.similar(id),
        ])
        setMovie(detailRes.data)
        setSimilar(simRes.data.movies || [])
        if (isAuthenticated) {
          const ratingRes = await moviesAPI.myRating(id)
          setMyRating(ratingRes.data.rating)
          setUserRating(ratingRes.data.rating || 0)
        }
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    fetchMovie()
  }, [id, isAuthenticated])

  const toggleWatchlist = async () => {
    if (!isAuthenticated) { toast.error('Sign in to use watchlist'); return }
    try {
      if (inWatchlist) {
        await watchlistAPI.remove(Number(id))
        removeId(Number(id))
        toast.success('Removed from watchlist')
      } else {
        await watchlistAPI.add(Number(id))
        addId(Number(id))
        toast.success('Added to watchlist ✨')
      }
    } catch { toast.error('Something went wrong') }
  }

  const submitRating = async (rating) => {
    if (!isAuthenticated) { toast.error('Sign in to rate movies'); return }
    try {
      await moviesAPI.rate(id, rating)
      setMyRating(rating)
      setUserRating(rating)
      toast.success(`Rated ${rating}★`)
    } catch { toast.error('Could not save rating') }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-bg pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-96 shimmer rounded-3xl mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 h-96 shimmer rounded-2xl" />
            <div className="md:col-span-2 space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 shimmer rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!movie) return (
    <div className="min-h-screen bg-cinema-bg flex items-center justify-center">
      <p className="text-zinc-400">Movie not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-cinema-bg">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[65vh] overflow-hidden">
        {movie.backdrop_path && (
          <img src={getProxyImageUrl(movie.backdrop_path)} alt={movie.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/60 to-transparent" />

        {/* Back button */}
        <button onClick={() => navigate(-1)} className="absolute top-24 left-6 glass p-2.5 rounded-xl hover:bg-white/15 transition-all">
          <ChevronLeft size={20} className="text-white" />
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 md:-mt-64 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Poster */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-48 md:w-64 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img src={movie.poster_path ? getProxyImageUrl(movie.poster_path) : `https://via.placeholder.com/300x450/1a1a2e/666?text=${encodeURIComponent(movie.title)}`}
                alt={movie.title} className="w-full h-full object-cover"
                onError={e => { e.target.src = `https://via.placeholder.com/300x450/1a1a2e/666?text=${encodeURIComponent(movie.title)}` }}
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex-1 pt-4">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">{movie.title}</h1>
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="text-zinc-400 text-lg mb-3">{movie.original_title}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-5">
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-amber-400">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-zinc-500 text-sm">({movie.vote_count?.toLocaleString()})</span>
                </div>
              )}
              {movie.release_date && <span className="text-zinc-400 text-sm flex items-center gap-1"><Clock size={14}/> {movie.release_date.slice(0,4)}</span>}
              {movie.runtime && <span className="text-zinc-400 text-sm">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
              {movie.language && <span className="text-zinc-400 text-sm flex items-center gap-1"><Globe size={14}/> {movie.language}</span>}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {movie.genres?.map(g => <span key={g} className="genre-badge">{g}</span>)}
            </div>

            <p className="text-zinc-300 leading-relaxed mb-6 max-w-2xl">{movie.overview}</p>

            {/* OTT Platforms */}
            {movie.ott_platforms?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-zinc-500 mb-2 font-medium">Available on</p>
                <div className="flex flex-wrap gap-2">
                  {movie.ott_platforms.map(p => (
                    <span key={p} className="px-3 py-1 text-sm bg-white/8 border border-white/10 rounded-lg text-zinc-300">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-8">
              {movie.trailer_key && (
                <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-all active:scale-95">
                  <Play size={18} className="fill-black" /> Watch Trailer
                </button>
              )}
              <button onClick={toggleWatchlist}
                className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 ${inWatchlist ? 'bg-red-600 text-white' : 'btn-secondary'}`}
              >
                {inWatchlist ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>

            {/* User Rating */}
            {isAuthenticated && (
              <div className="glass rounded-2xl p-5 max-w-sm">
                <p className="text-sm font-semibold text-zinc-300 mb-3">{myRating ? `Your rating: ${myRating}★` : 'Rate this movie'}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => submitRating(star)}
                      className="transition-transform hover:scale-125 active:scale-110"
                    >
                      <Star size={28}
                        className={`transition-colors ${star <= (hoverRating || userRating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Cast */}
        {movie.cast?.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-14">
            <h2 className="section-title">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {movie.cast.map(actor => (
                <div key={actor.id} className="flex-shrink-0 w-28 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2 ring-2 ring-white/10">
                    {actor.profile_path
                      ? <img src={getProxyImageUrl(actor.profile_path)} alt={actor.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500">{actor.name[0]}</div>
                    }
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-2">{actor.name}</p>
                  <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{actor.character}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Similar Movies */}
        <div className="mt-14">
          <MovieRow title="🎬 You Might Also Like" movies={similar} />
        </div>
      </div>

      {/* Full-screen Trailer Modal */}
      {showTrailer && movie.trailer_key && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <button onClick={() => setShowTrailer(false)} className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl text-white z-20 hover:bg-white/20 transition-colors">✕</button>
            <ReactPlayer url={`https://www.youtube.com/watch?v=${movie.trailer_key}`} playing={true} controls={true} width="100%" height="100%" />
          </div>
        </div>
      )}
    </div>
  )
}
