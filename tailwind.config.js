/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          lime: {
            DEFAULT: '#CCFF00',
            hover: '#A3CC00',
            glow: 'rgba(204, 255, 0, 0.45)',
          },
          orange: {
            DEFAULT: '#FF5E3A',
            hover: '#E04824',
            glow: 'rgba(255, 94, 58, 0.45)',
          },
          cyan: {
            DEFAULT: '#00F0FF',
            glow: 'rgba(0, 240, 255, 0.35)',
          }
        },
        dark: {
          bg: '#080C14',
          card: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#F8FAFC',
          muted: '#94A3B8',
        }
      },
      boxShadow: {
        'neon-lime': '0 0 15px rgba(204, 255, 0, 0.3)',
        'neon-orange': '0 0 15px rgba(255, 94, 58, 0.3)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
