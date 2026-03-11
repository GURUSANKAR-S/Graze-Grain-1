/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5efe6",
        foreground: "#1f1a17",
        surface: "#fffaf3",
        "surface-strong": "#fff6eb",
        brand: "#8f4d24",
        "brand-strong": "#6f3515",
        muted: "#6f6257",
        ring: "#d9b08c",
      },
    },
  },
  plugins: [],
};
