/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF9FE',
          100: '#F1EFFD',
          200: '#E0DBFC',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED', // Primary Royal Purple
          700: '#6D28D9',
          800: '#5B21B6', // Deep Purple
          900: '#4C1D95', // Indigo Purple
          950: '#2E1065',
        },
        surface: {
          bg: '#FAF9FE',
          card: '#FFFFFF',
          border: '#F1EFFD',
          dark: '#1E1B4B',
          muted: '#64748B',
        },
        accent: {
          gold: '#F59E0B',
          green: '#10B981',
          rose: '#F43F5E',
          sky: '#0EA5E9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(109, 40, 217, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'hero': '0 12px 30px -4px rgba(109, 40, 217, 0.3)',
        'glow': '0 0 25px rgba(124, 58, 237, 0.35)',
        'dock': '0 -4px 25px rgba(109, 40, 217, 0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}

