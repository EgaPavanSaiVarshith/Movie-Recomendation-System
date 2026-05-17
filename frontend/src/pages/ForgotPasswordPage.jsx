import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Film, Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { authAPI } from '../api/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ username: '', email: '', new_password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.resetPassword(form)
      toast.success('Password reset successfully! Please sign in. 🎬')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. Check your username and email.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cinema-bg flex items-center justify-center px-4 pt-16">
      {/* Background blur circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Film size={28} className="text-red-500" />
              <span className="text-2xl font-black text-gradient">CINEAI</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-zinc-400 text-sm mt-1">Enter your details to create a new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text" required
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="your_username"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPass ? 'text' : 'password'} required minLength={6}
                  value={form.new_password}
                  onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="input-field pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
