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
          light: '#6B46C1',    // Dark purple
          DEFAULT: '#553C9A',  // Deep purple
          dark: '#44337A',     // Very deep purple
          fontlight: '#E2E8F0', // Ice gray light
          fontdark: '#1A202C'   // Very deep gray
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
