/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#101D35', dark: '#0A1324', light: '#1A2B4C' },
        gold: { DEFAULT: '#C5A15B', light: '#D4B87C', dark: '#9E7D3B' },
        ivory: { DEFAULT: '#F6F2EA', dark: '#EAE3D2' },
        charcoal: '#252A33',
        stone: '#B7B0A4',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};