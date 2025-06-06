/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // adjust based on your folder structure
  ],
  theme: {
    extend: {
      fontFamily: {
        euclidCircular: ['EuclidCircular'],
        arial: ['Arial']
      }
    },
  },
  plugins: [],
}
