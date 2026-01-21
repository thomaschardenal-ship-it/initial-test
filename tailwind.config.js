/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#06B6D4',
        secondary: '#F59E0B',
        danger: '#ef4444',
        navy: '#1e293b',
        'navy-dark': '#0f172a',
      }
    }
  },
  plugins: []
}
