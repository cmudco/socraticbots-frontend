/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        socratic: {
          light: 'var(--color-socratic-light)',
          DEFAULT: 'var(--color-socratic)',
          dark: 'var(--color-socratic-dark)'
        },
        'socratic-font': {
          light: 'var(--color-socratic-font-light)',
          dark: 'var(--color-socratic-font-dark)'
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
