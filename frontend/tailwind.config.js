/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#16233D',
          soft: '#26344F',
        },
        primary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          soft: '#EFF4FF',
        },
        success: {
          DEFAULT: '#0D9488',
          light: '#D8F5F0',
        },
        emerald: {
          DEFAULT: '#10B981',
          light: '#DCFCE7',
        },
        attention: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        critical: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        periwinkle: {
          DEFAULT: '#EEF2FB',
          deep: '#DDE6F7',
        },
        ink: {
          soft: '#5B6B85',
          faint: '#8A97AD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(22,35,61,0.06), 0 8px 24px rgba(22,35,61,0.06)',
        float: '0 12px 40px rgba(22,35,61,0.14)',
        glow: '0 0 0 4px rgba(37,99,235,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.82)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'toast-in': 'toast-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};