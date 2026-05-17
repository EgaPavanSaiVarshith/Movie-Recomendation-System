import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'
import TrendingPage from './pages/TrendingPage'
import RecommendationsPage from './pages/RecommendationsPage'
import SearchPage from './pages/SearchPage'
import WatchlistPage from './pages/WatchlistPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } }
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-cinema-bg text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <Chatbot />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
              success: { iconTheme: { primary: '#e50914', secondary: '#fff' } },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  )
}
