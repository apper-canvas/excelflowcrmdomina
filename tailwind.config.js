/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3'
        },
        secondary: {
          500: '#7C3AED',
          600: '#7C3AED'
        },
        accent: {
          500: '#EC4899',
          600: '#DB2777'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}