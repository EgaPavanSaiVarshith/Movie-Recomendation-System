/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a2e',
          red: '#e50914',
          gold: '#f59e0b',
          border: 'rgba(255,255,255,0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(10,10,15,0) 0%, rgba(10,10,15,1) 100%)',
      }
    },
  },
  plugins: [],
}
