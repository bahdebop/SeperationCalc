/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'military-navy': '#1a2332',
        'military-navy-light': '#2d3748',
        'military-olive': '#4a5568',
        'military-amber': '#d69e2e',
        'military-amber-light': '#ecc94b',
      },
      fontFamily: {
        'display': ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
