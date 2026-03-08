/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        netflix: {
          black: "#141414",
          red: "#E50914",
          "red-dark": "#B20710",
          dark: "#1a1a1a",
          card: "#222222",
          "card-hover": "#2a2a2a",
          gray: "#808080",
          "light-gray": "#b3b3b3",
          white: "#e5e5e5",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
