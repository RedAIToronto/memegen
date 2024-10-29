/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aidobe: {
          pink: '#FF69B4',
          secondary: '#4A90E2',
          accent: '#50C878',
          kawaii: '#FFB7C5',
          light: '#F5F5F5',
          dark: '#2D2D2D',
        }
      },
      boxShadow: {
        'aidobe-hover': '0 10px 20px rgba(255, 105, 180, 0.2), 0 6px 6px rgba(255, 105, 180, 0.1)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
