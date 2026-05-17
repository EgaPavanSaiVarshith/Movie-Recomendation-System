import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store'
import { usersAPI } from '../api/client'
import { User, Star, Bookmark, Edit2, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Animation', 'Thriller', 'Documentary']
const LANGUAGES = ['Telugu', 'Hindi', 'English', 'Tamil', 'Malayalam', 'Korean', 'Japanese']

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    const fetch = async () => {
      try {
        const res = await usersAPI.profile()
        setProfile(res.data)
        setEditData({ full_name: res.data.full_name || '', preferred_genres: res.data.preferred_genres || [], preferred_languages: res.data.preferred_languages || [] })
      } catch { }
      setLoading(false)
    }
    fetch()
  }, [isAuthenticated])

  const toggleGenre = (g) => setEditData(d => ({ ...d, preferred_genres: d.preferred_genres.includes(g) ? d.preferred_genres.filter(x => x !== g) : [...d.preferred_genres, g] }))
  const toggleLang = (l) => setEditData(d => ({ ...d, preferred_languages: d.preferred_languages.includes(l) ? d.preferred_languages.filter(x => x !== l) : [...d.preferred_languages, l] }))

  const saveProfile = async () => {
    try {
      const res = await usersAPI.updateProfile(editData)
      setProfile(p => ({ ...p, ...res.data }))
      updateUser(res.data)
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cinema-bg flex items-center justify-center">
        <div className="text-center glass rounded-3xl p-12">
          <User size={60} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your profile</h2>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  if (loading) return <div className="min-h-screen bg-cinema-bg pt-24 flex items-center justify-center"><div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-cinema-bg pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 mb-6 border border-white/10 relative">
          <button onClick={() => editing ? saveProfile() : setEditing(true)}
            className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${editing ? 'bg-green-600 text-white' : 'glass text-zinc-400 hover:text-white border border-white/10'}`}
          >
            {editing ? <><Check size={15} /> Save</> : <><Edit2 size={15} /> Edit</>}
          </button>
          {editing && (
            <button onClick={() => setEditing(false)} className="absolute top-6 right-28 flex items-center gap-2 px-4 py-2 rounded-xl text-sm glass text-zinc-400 border border-white/10">
              <X size={15} /> Cancel
            </button>
          )}

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-3xl font-black text-white shadow-xl">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{profile?.username}</h1>
              {editing ? (
                <input value={editData.full_name} onChange={e => setEditData(d => ({ ...d, full_name: e.target.value }))}
                  placeholder="Your full name" className="input-field mt-2 text-sm max-w-xs" />
              ) : (
                <p className="text-zinc-400">{profile?.full_name || 'No name set'}</p>
              )}
              <p className="text-zinc-500 text-sm">{profile?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Star, label: 'Movies Rated', value: profile?.stats?.ratings || 0, color: 'text-amber-400' },
              { icon: Bookmark, label: 'Watchlist', value: profile?.stats?.watchlist || 0, color: 'text-red-400' },
              { icon: User, label: 'Member Since', value: new Date(profile?.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' }), color: 'text-blue-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass rounded-2xl p-4 border border-white/8">
                <Icon size={20} className={`mb-2 ${color}`} />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-8 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Your Preferences</h2>

          <div className="mb-6">
            <p className="text-sm font-medium text-zinc-400 mb-3">Favorite Genres</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g} type="button"
                  onClick={() => editing && toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${(editing ? editData.preferred_genres : profile?.preferred_genres || []).includes(g)
                    ? 'bg-red-600 text-white'
                    : editing ? 'glass text-zinc-400 hover:text-white border border-white/10 cursor-pointer' : 'glass text-zinc-600 border border-white/5 cursor-default'
                  }`}
                >{g}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-400 mb-3">Preferred Languages</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <button key={l} type="button"
                  onClick={() => editing && toggleLang(l)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${(editing ? editData.preferred_languages : profile?.preferred_languages || []).includes(l)
                    ? 'bg-purple-600 text-white'
                    : editing ? 'glass text-zinc-400 hover:text-white border border-white/10 cursor-pointer' : 'glass text-zinc-600 border border-white/5 cursor-default'
                  }`}
                >{l}</button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
