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
          light: '#4299E1',    // Light blue
          DEFAULT: '#2B6CB0',  // Medium blue
          dark: '#2C5282',     // Dark blue
          fontlight: '#EBF8FF', // Almost white with blue tint
          fontdark: '#1A365D'   // Dark blue-gray
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
