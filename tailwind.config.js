/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          indigo: '#330066',
          purple: '#5c2d91',
          orange: '#f49638',
          cyan: '#4abdc9',
          teal: '#34a4b1',
          grey: '#c9c9c9',
        },
      },
    },
  },
  plugins: [],
}