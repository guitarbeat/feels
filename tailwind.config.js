/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    // Add any other directories where you use Tailwind classes
  ],
  theme: {
    extend: {
      colors: {
        // These must be named without dashes for Tailwind to recognize them correctly
        border: '#E5E5E5',
        background: '#FFFFFF',
        accent: '#303030',
        
        // Standard Tailwind format for grays
        gray: {
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#555555',
          700: '#404040',
          800: '#2D2D2D',
          900: '#121212',
        },
        
        // Core colors
        transparent: 'transparent',
        current: 'currentColor',
        black: '#000000',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
}

