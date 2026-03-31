/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          1: "#0B0F14",
          2: "#11161C",
          3: "#1A2027",
          4: "#232B35",
        },
        ink: {
          primary: "#E6EDF3",
          secondary: "#9AA4AF",
          muted: "#6B7280",
        },
        border: {
          DEFAULT: "#1F2933",
          strong: "#2D3B47",
        },
        accent: {
          DEFAULT: "#1C7C54",
          light: "#22A06B",
          muted: "#143E2B",
          fg: "#CFFBE4",
        },
        intensity: {
          low: "#22A06B",
          medium: "#D4A017",
          high: "#C0392B",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
