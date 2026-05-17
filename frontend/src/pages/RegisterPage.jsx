import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Film, Mail, Lock, User, AlertCircle, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { authAPI } from '../api/client'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Animation', 'Thriller', 'Documentary']
const LANGUAGES = ['Telugu', 'Hindi', 'English', 'Tamil', 'Malayalam', 'Korean', 'Japanese']

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' })
  const [prefs, setPrefs] = useState({ genres: [], languages: [] })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const toggleGenre = (g) => setPrefs(p => ({ ...p, genres: p.genres.includes(g) ? p.genres.filter(x => x !== g) : [...p.genres, g] }))
  const toggleLang = (l) => setPrefs(p => ({ ...p, languages: p.languages.includes(l) ? p.languages.filter(x => x !== l) : [...p.languages, l] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.register({
        ...form,
        preferred_genres: prefs.genres,
        preferred_languages: prefs.languages
      })
      setAuth(res.data.user, res.data.access_token)
      toast.success(`Welcome to CineAI, ${res.data.user.username}! 🎬`)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cinema-bg flex items-center justify-center px-4 pt-16 pb-8">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Film size={28} className="text-red-500" />
              <span className="text-2xl font-black text-gradient">CINEAI</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-zinc-400 text-sm mt-1">Start discovering amazing movies</p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-red-600 text-white' : 'bg-white/10 text-zinc-500'}`}>
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 rounded transition-all ${step > s ? 'bg-red-600' : 'bg-white/10'}`} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Your full name" className="input-field pl-11" />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">Username *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                  <input type="text" required minLength={3} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="username" className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">Email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com" className="input-field pl-11" />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1.5 block">Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type={showPass ? 'text' : 'password'} required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 6 characters" className="input-field pl-11 pr-11" />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Continue →</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-zinc-300 mb-3 block">Favorite Genres (pick any)</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <button type="button" key={g} onClick={() => toggleGenre(g)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${prefs.genres.includes(g) ? 'bg-red-600 text-white' : 'glass text-zinc-400 hover:text-white border border-white/10'}`}
                    >{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-300 mb-3 block">Preferred Languages (pick any)</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => (
                    <button type="button" key={l} onClick={() => toggleLang(l)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${prefs.languages.includes(l) ? 'bg-purple-600 text-white' : 'glass text-zinc-400 hover:text-white border border-white/10'}`}
                    >{l}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account 🎬'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-zinc-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
