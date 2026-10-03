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
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
        },
        chrome: {
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
        }
      }
    },
  },
  plugins: [],
}
