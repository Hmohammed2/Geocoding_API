/** @type {import('tailwindcss').Config} */
export default {
  content: [    './pages/**/*.{html,js}',
  "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'], // Default font family for Tailwind
      },
    },
  },
  plugins: [],
  darkMode: 'media'
}