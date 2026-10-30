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
          dark: '#F4F6F8',
          darker: '#EEF2F6',
          card: '#FFFFFF',
          surface: '#FFFFFF',
          border: '#E6EAF0',
        },
        'navy-dark': '#F4F6F8',
        'navy-darker': '#EEF2F6',
        'navy-card': '#FFFFFF',
        'navy-surface': '#FFFFFF',
        'navy-border': '#E6EAF0',
        'blue-primary': '#0F766E',
        'blue-primary-hover': '#115E59',
        'blue-accent': '#14B8A6',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-disabled': '#94A3B8',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        chart: {
          1: '#0F766E',
          2: '#0284C7',
          3: '#7C3AED',
          4: '#D97706',
          5: '#BE185D',
          grid: '#E6EAF0',
        },
        'chart-1': '#0F766E',
        'chart-2': '#0284C7',
        'chart-3': '#7C3AED',
        'chart-4': '#D97706',
        'chart-5': '#BE185D',
        'chart-grid': '#E6EAF0',
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
