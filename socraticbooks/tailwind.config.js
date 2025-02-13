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
        }
      }
    },
  },
  plugins: [],
}
