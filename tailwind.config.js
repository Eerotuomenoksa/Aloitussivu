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
        display: ["'DM Sans'", 'Arial', 'sans-serif'],
        body: ["'DM Sans'", 'Arial', 'sans-serif'],
        sans: ["'DM Sans'", 'Arial', 'sans-serif'],
        serif: ["'DM Sans'", 'Arial', 'sans-serif'],
        mono: ["'DM Sans'", 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          indigo: '#173e5f',
          purple: '#214f76',
          orange: '#d09a32',
          cyan: '#4abdc9',
          teal: '#34a4b1',
          grey: '#c9c9c9',
        },
      },
    },
  },
  plugins: [],
}
