/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        sidebar: {
          DEFAULT: '#0C1222',
          hover: '#151C2E',
          active: '#1A2740',
          border: '#1E293B',
          muted: '#94A3B8',
        },
        navy: {
          dark: '#080D1A',
          darker: '#0D1424',
          card: '#151F33',
          surface: '#111A2D',
          border: '#263451',
        },
        'navy-dark': '#080D1A',
        'navy-darker': '#0D1424',
        'navy-card': '#151F33',
        'navy-surface': '#111A2D',
        'navy-border': '#263451',
        'blue-primary': '#4F7CFF',
        'blue-primary-hover': '#6B93FF',
        'blue-accent': '#22D3EE',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-disabled': '#64748B',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#FB7185',
        chart: {
          1: '#4F7CFF',
          2: '#22D3EE',
          3: '#A78BFA',
          4: '#FBBF24',
          5: '#FB7185',
          grid: '#263451',
        },
        'chart-1': '#4F7CFF',
        'chart-2': '#22D3EE',
        'chart-3': '#A78BFA',
        'chart-4': '#FBBF24',
        'chart-5': '#FB7185',
        'chart-grid': '#263451',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04)',
        elevated: '0 16px 40px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        card: '14px',
        button: '10px',
        input: '10px',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
