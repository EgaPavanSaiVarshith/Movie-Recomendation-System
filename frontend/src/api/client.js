import axios from 'axios'

const isProduction = import.meta.env.PROD
const API_BASE_URL = isProduction ? '' : 'http://localhost:8000'

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

export const getProxyImageUrl = (url) => {
  return url;
}

// Attach auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cineai_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cineai_token')
      localStorage.removeItem('cineai_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/api/auth/register', data),
  login: (data) => API.post('/api/auth/login', data),
  me: () => API.get('/api/auth/me'),
  logout: () => API.post('/api/auth/logout'),
}

// ─── Movies ───────────────────────────────────────────
export const moviesAPI = {
  search: (q, page = 1) => API.get('/api/movies/search', { params: { q, page } }),
  trending: (period = 'week') => API.get('/api/movies/trending', { params: { period } }),
  nowPlaying: (page = 1) => API.get('/api/movies/now-playing', { params: { page } }),
  popular: (page = 1) => API.get('/api/movies/popular', { params: { page } }),
  topRated: (page = 1) => API.get('/api/movies/top-rated', { params: { page } }),
  details: (id) => API.get(`/api/movies/${id}`),
  similar: (id) => API.get(`/api/movies/${id}/similar`),
  byLanguage: (lang, page = 1) => API.get(`/api/movies/by-language/${lang}`, { params: { page } }),
  rate: (id, rating, review) => API.post(`/api/movies/${id}/rate`, null, { params: { rating, review } }),
  myRating: (id) => API.get(`/api/movies/${id}/my-rating`),
}

// ─── Recommendations ──────────────────────────────────
export const recsAPI = {
  personalized: (n = 20) => API.get('/api/recommendations/personalized', { params: { n } }),
  similar: (id, n = 12) => API.get(`/api/recommendations/similar/${id}`, { params: { n } }),
  byGenre: (genres, n = 20) => API.get('/api/recommendations/by-genre', { params: { genres: genres.join(','), n } }),
  mood: (mood, n = 20) => API.get(`/api/recommendations/mood/${mood}`, { params: { n } }),
  trending: (period = 'week') => API.get('/api/recommendations/trending', { params: { period } }),
  popularity: (n = 20) => API.get('/api/recommendations/popular', { params: { n } }),
  byLanguage: (lang, n = 20) => API.get(`/api/recommendations/by-language/${lang}`, { params: { n } }),
  loadEngine: () => API.post('/api/recommendations/load-engine'),
}

// ─── Watchlist ────────────────────────────────────────
export const watchlistAPI = {
  get: () => API.get('/api/watchlist'),
  add: (id) => API.post(`/api/watchlist/${id}`),
  remove: (id) => API.delete(`/api/watchlist/${id}`),
  check: (id) => API.get(`/api/watchlist/check/${id}`),
}

// ─── Users ────────────────────────────────────────────
export const usersAPI = {
  profile: () => API.get('/api/users/profile'),
  updateProfile: (data) => API.put('/api/users/profile', data),
  myRatings: () => API.get('/api/users/ratings'),
}

// ─── Chatbot ──────────────────────────────────────────
export const chatbotAPI = {
  chat: (message, history = []) => API.post('/api/chatbot', { message, history }),
}

export default API
