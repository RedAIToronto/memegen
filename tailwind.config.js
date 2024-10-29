/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#171717',
          600: '#0a0a0a',
          700: '#000000',
        },
        secondary: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#e5e5e5',
          300: '#737373',
          400: '#525252',
          500: '#262626',
          600: '#171717',
          700: '#000000',
        }
      },
      boxShadow: {
        'modern': '0 2px 8px -2px rgba(0,0,0,0.05), 0 4px 16px -4px rgba(0,0,0,0.1)',
        'modern-lg': '0 4px 12px -2px rgba(0,0,0,0.05), 0 8px 32px -8px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}
