import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'

export default function MovieRow({ title, movies = [], loading = false, badge = null }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="h-7 w-48 shimmer rounded-lg" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 sm:w-44">
              <div className="aspect-[2/3] shimmer rounded-2xl" />
              <div className="h-4 shimmer rounded mt-2" />
              <div className="h-3 shimmer rounded mt-1 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!movies.length) return null

  return (
    <section className="mb-10 group/row">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="section-title mb-0">{title}</h2>
          {badge && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-600 text-white animate-pulse">{badge}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll(-1)} className="p-2 glass rounded-xl text-zinc-400 hover:text-white transition-all opacity-0 group-hover/row:opacity-100">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(1)} className="p-2 glass rounded-xl text-zinc-400 hover:text-white transition-all opacity-0 group-hover/row:opacity-100">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {movies.map((movie, i) => (
          <div key={movie.tmdb_id || i} className="flex-shrink-0 w-36 sm:w-40 md:w-44">
            <MovieCard movie={movie} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}
