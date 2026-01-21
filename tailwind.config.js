/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        danger: '#ef4444',
      }
    }
  },
  plugins: []
}
