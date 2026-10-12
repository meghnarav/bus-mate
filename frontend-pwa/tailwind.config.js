/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Redesigned Transit Tech Design System
        transit: {
          red: '#D82C2C',        // Primary Transit Red
          redHover: '#B91C1C',   // Red hover
          redLight: '#FEF2F2',   // Red surface tint
          redBorder: '#FCA5A5',
          ink: '#0F172A',        // Deep Ink / Slate
          surface: '#F8FAFC',    // App background / canvas
          border: '#E2E8F0',     // Crisp card border
          subtle: '#64748B',     // Secondary slate text
          muted: '#94A3B8',
        },
        status: {
          live: '#16A34A',       // Emerald
          liveBg: '#F0FDF4',
          filling: '#D97706',    // Amber
          fillingBg: '#FFFBEB',
          soldOut: '#E11D48',    // Rose
          soldOutBg: '#FFF1F2',
          female: '#EC4899',     // Pink reserved priority
          femaleBg: '#FDF2F8',
        },
        // Legacy compatibility
        obsidian: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        busmate: {
          400: '#D82C2C',
          500: '#B91C1C',
          600: '#991B1B',
        },
        accent: {
          400: '#0284C7',
          500: '#0369A1',
          600: '#075985',
        }
      }
    },
  },
  plugins: [],
}
