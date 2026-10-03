/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        obsidian: {
          900: '#0a0a0f',
          800: '#13141c',
          700: '#1e202d',
        },
        busmate: {
          400: '#FFD700', // Vibrant School Bus Yellow
          500: '#FFB800', // Deep Yellow
          600: '#E6A600',
        },
        accent: {
          400: '#00E5FF', // Neon Cyan
          500: '#00B8D4', // Deep Cyan
          600: '#0097A7',
        }
      }
    },
  },
  plugins: [],
}
