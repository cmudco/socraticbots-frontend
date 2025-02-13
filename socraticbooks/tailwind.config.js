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
          light: '#4A90E2',  // lighter blue
          DEFAULT: '#2C5282', // main blue
          dark: '#1A365D',   // darker blue
          fontlight: '#F7FAFC', // light font color
          fontdark: '#1A202C',  // dark font color
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
