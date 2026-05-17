import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react'
import { useUIStore } from '../store'
import { chatbotAPI } from '../api/client'

export default function Chatbot() {
  const { chatOpen, setChatOpen } = useUIStore()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "🎬 Hey! I'm CineAI, your movie guide. Ask me for recommendations by mood, genre, or language!", suggestions: ['Telugu movies', 'I\'m feeling happy', 'Trending now', 'Korean films'] }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await chatbotAPI.chat(msg, history)
      const { reply, suggestions } = res.data
      setMessages(prev => [...prev, { role: 'assistant', content: reply, suggestions }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble right now. Try again!" }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-2xl shadow-red-900/50 flex items-center justify-center animate-glow"
      >
        <AnimatePresence mode="wait">
          {chatOpen
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] glass-dark rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
            style={{ height: '480px' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-900/30 to-red-800/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">CineAI Assistant</p>
                <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${m.role === 'user' ? '' : 'flex gap-2 items-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={13} className="text-white" />
                      </div>
                    )}
                    <div>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${m.role === 'user'
                        ? 'bg-red-600 text-white rounded-tr-sm'
                        : 'bg-white/8 text-zinc-200 rounded-tl-sm border border-white/10'
                      }`}>
                        {m.content}
                      </div>
                      {m.suggestions && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {m.suggestions.map((s, si) => (
                            <button key={si} onClick={() => send(s)}
                              className="text-xs px-2.5 py-1 rounded-full bg-white/8 border border-white/15 text-zinc-300 hover:bg-white/15 hover:text-white transition-all"
                            >{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="flex gap-1 bg-white/8 px-4 py-3 rounded-2xl rounded-tl-sm">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask for movie recommendations..."
                  className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                />
                <button onClick={() => send()} disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 flex items-center justify-center transition-all active:scale-95"
                >
                  <Send size={15} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
