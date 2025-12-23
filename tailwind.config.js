import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        lg: '2rem',
        xl: '3rem'
      }
    },
    extend: {
      colors: {
        // Keep the same palette but expose semantic names
        primary: colors.blue,
        success: colors.green,
        danger: colors.red,
        neutral: colors.gray,
        // subtle brand green used in navbar
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        }
      },
      fontFamily: {
        // Preserve Parkinsans as primary with sensible fallbacks
        sans: ['Parkinsans', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 6px 20px rgba(2,6,23,0.06)',
        'soft': '0 4px 12px rgba(2,6,23,0.06)'
      },
      spacing: {
        '9': '2.25rem',
      }
    },
  },
  plugins: [],
}

