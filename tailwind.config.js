/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./popup.tsx",
    "./sidepanel.tsx",
    "./components/**/*.tsx",
    "./hooks/**/*.ts",
    "./contexts/**/*.tsx"
  ],
  theme: {
    extend: {
      animation: {
        'in': 'animate-in 0.3s ease-out',
      },
      keyframes: {
        'animate-in': {
          'from': {
            opacity: '0',
            transform: 'translateY(8px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      }
    }
  },
  plugins: [],
  prefix: "plasmo-"
}

