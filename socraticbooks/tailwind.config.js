/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'socratic': {
          light: '#4FD1C5',    // Refreshing teal
          DEFAULT: '#319795',   // Balanced teal
          dark: '#2C7A7B',     // Deep teal
          fontlight: '#F0FDFA', // Clean white with teal tint
          fontdark: '#234E52',  // Dark teal-gray
        }
      },
      fontSize: {
        'socratic-xs': '0.75rem',
        'socratic-sm': '0.875rem',
        'socratic-base': '1rem',
        'socratic-lg': '1.125rem',
        'socratic-xl': '1.25rem',
        'socratic-2xl': '1.5rem',
        'socratic-3xl': '1.875rem',
        'socratic-4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
