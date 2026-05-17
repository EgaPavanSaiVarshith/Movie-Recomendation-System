import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { moviesAPI } from '../api/client'
import MovieCard from '../components/MovieCard'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [query, setQuery] = useState(q)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (q) doSearch(q)
  }, [q])

  const doSearch = async (searchQ) => {
    setLoading(true)
    setSearched(true)
    try {
      const res = await moviesAPI.search(searchQ)
      setResults(res.data.results || [])
    } catch { setResults([]) }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) { setSearchParams({ q: query }); doSearch(query) }
  }

  return (
    <div className="min-h-screen bg-cinema-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-6">Search Movies</h1>
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, genre, actor..."
                className="input-field pl-12"
              />
            </div>
            <button type="submit" className="btn-primary px-6 whitespace-nowrap">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}><div className="aspect-[2/3] shimmer rounded-2xl" /><div className="h-4 shimmer rounded mt-2" /></div>
            ))}
          </div>
        ) : searched ? (
          results.length > 0 ? (
            <>
              <p className="text-zinc-400 mb-6">{results.length} results for "<span className="text-white">{q}</span>"</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((movie, i) => <MovieCard key={movie.tmdb_id} movie={movie} index={i} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎬</div>
              <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
              <p className="text-zinc-400">Try searching with different keywords</p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <Search size={60} className="mx-auto text-zinc-700 mb-4" />
            <h2 className="text-xl font-bold text-zinc-500">Start searching for movies</h2>
          </div>
        )}
      </div>
    </div>
  )
}
