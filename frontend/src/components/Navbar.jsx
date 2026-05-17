import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, Menu, X, User, LogOut, Bookmark, ChevronDown } from 'lucide-react'
import { useAuthStore, useUIStore } from '../store'
import { moviesAPI } from '../api/client'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const { searchOpen, setSearchOpen } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }, [location.pathname])

  const handleSearch = (q) => {
    setSearchQuery(q)
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setSearchResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await moviesAPI.search(q)
        setSearchResults(res.data.results?.slice(0, 6) || [])
      } catch { setSearchResults([]) }
      setSearching(false)
    }, 400)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenu(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/trending', label: 'Trending' },
    { to: '/recommendations', label: 'For You' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-black text-gradient tracking-tight">CINE<span className="text-white">AI</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-medium transition-colors duration-200 ${location.pathname === l.to ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
              >{l.label}</Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                <Search size={20} />
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: '300px' }}
                    exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                    className="absolute right-0 top-0 overflow-hidden"
                  >
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && searchQuery) { navigate(`/search?q=${searchQuery}`); setSearchOpen(false) } }}
                      placeholder="Search movies..."
                      className="input-field h-10 pr-10 text-sm"
                    />
                    {/* Autocomplete */}
                    {searchResults.length > 0 && (
                      <div className="absolute top-12 right-0 w-full glass-dark rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        {searchResults.map(m => (
                          <button key={m.tmdb_id} onClick={() => { navigate(`/movie/${m.tmdb_id}`); setSearchOpen(false) }}
                            className="flex items-center gap-3 w-full p-3 hover:bg-white/10 transition-colors text-left"
                          >
                            {m.poster_path
                              ? <img src={m.poster_path} alt={m.title} className="w-10 h-14 object-cover rounded" />
                              : <div className="w-10 h-14 bg-zinc-800 rounded flex items-center justify-center text-xs text-zinc-500">?</div>
                            }
                            <div>
                              <p className="text-sm font-medium text-white line-clamp-1">{m.title}</p>
                              <p className="text-xs text-zinc-400">{m.release_date?.slice(0, 4)} • {m.language}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <>
                <Link to="/watchlist" className="hidden sm:flex p-2 text-zinc-400 hover:text-white transition-colors">
                  <Bookmark size={20} />
                </Link>
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm text-white max-w-[80px] truncate">{user?.username}</span>
                    <ChevronDown size={14} className="text-zinc-400" />
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-12 glass-dark rounded-xl p-2 w-48 shadow-2xl border border-white/10"
                      >
                        <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <User size={15} /> Profile
                        </Link>
                        <Link to="/watchlist" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Bookmark size={15} /> Watchlist
                        </Link>
                        <div className="border-t border-white/10 my-1" />
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Join Free</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button className="md:hidden p-2 text-zinc-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="md:hidden glass-dark border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} className="block px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors">{l.label}</Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
