import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('cineai_token', token)
        set({ user, token, isAuthenticated: true })
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('cineai_token')
        localStorage.removeItem('cineai_user')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'cineai_user',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export const useUIStore = create((set) => ({
  searchQuery: '',
  searchOpen: false,
  chatOpen: false,
  currentMood: null,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchOpen: (v) => set({ searchOpen: v }),
  setChatOpen: (v) => set({ chatOpen: v }),
  setCurrentMood: (m) => set({ currentMood: m }),
}))

export const useWatchlistStore = create((set, get) => ({
  watchlistIds: new Set(),
  setWatchlistIds: (ids) => set({ watchlistIds: new Set(ids) }),
  addId: (id) => set((s) => ({ watchlistIds: new Set([...s.watchlistIds, id]) })),
  removeId: (id) => set((s) => {
    const next = new Set(s.watchlistIds)
    next.delete(id)
    return { watchlistIds: next }
  }),
  isInWatchlist: (id) => get().watchlistIds.has(id),
}))
