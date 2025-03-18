import type { Config } from "tailwindcss";

const config = {
  darkMode: "class", // Add this line to enable class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.925rem + 0.375vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.375rem)',
        'fluid-xl': 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.375rem + 0.625vw, 2rem)',
      },
      spacing: {
        'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        'fluid-3': 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
        'fluid-4': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        'fluid-5': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
        'safe-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'safe-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        'safe-3': 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
        'safe-4': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        'safe-5': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
      },
      padding: {
        responsive: 'clamp(1rem, 3vw, 2rem)',
      },
      gap: {
        responsive: 'clamp(1rem, 2vw, 2rem)',
      },
      minHeight: {
        dynamic: 'clamp(300px, 50vh, 800px)',
        'dynamic-sm': 'clamp(200px, 30vh, 400px)',
        'dynamic-lg': 'clamp(400px, 70vh, 1000px)',
      },
      maxWidth: {
        readable: '65ch',
        'fluid-lg': 'clamp(600px, 90vw, 1200px)',
        'fluid-md': 'clamp(400px, 85vw, 800px)',
        'fluid-sm': 'clamp(300px, 80vw, 600px)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(10px)"
          },
          to: {
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 5px rgba(99, 102, 241, 0.4))"
          },
          "50%": {
            filter: "drop-shadow(0 0 15px rgba(99, 102, 241, 0.7))"
          },
        },
        "dash": {
          from: { "stroke-dashoffset": "1000" },
          to: { "stroke-dashoffset": "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s infinite",
        "dash": "dash 1.5s ease-in-out forwards",
      },
    },
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/container-queries'),
  ],
} satisfies Config

export default config
