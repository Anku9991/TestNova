import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Navy
        primary: {
          50: "hsl(var(--primary) / 0.05)",
          100: "hsl(var(--primary) / 0.1)",
          200: "hsl(var(--primary) / 0.2)",
          300: "hsl(var(--primary) / 0.3)",
          400: "hsl(var(--primary) / 0.4)",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary) / 0.9)",
          700: "hsl(var(--primary) / 0.8)",
          800: "hsl(var(--primary) / 0.7)",
          900: "hsl(var(--primary) / 0.6)",
          950: "hsl(var(--primary) / 0.5)",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Secondary - Gold/Amber
        secondary: {
          50: "hsl(var(--secondary) / 0.05)",
          100: "hsl(var(--secondary) / 0.1)",
          200: "hsl(var(--secondary) / 0.2)",
          300: "hsl(var(--secondary) / 0.3)",
          400: "hsl(var(--secondary) / 0.4)",
          500: "hsl(var(--secondary))",
          600: "hsl(var(--secondary) / 0.9)",
          700: "hsl(var(--secondary) / 0.8)",
          800: "hsl(var(--secondary) / 0.7)",
          900: "hsl(var(--secondary) / 0.6)",
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Accent - Cyan
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Background
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(57, 73, 171, 0.4)" },
          "100%": { boxShadow: "0 0 20px rgba(57, 73, 171, 0.8)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        "hero-gradient":
          "linear-gradient(135deg, #0a0e27 0%, #1a237e 50%, #0d47a1 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(57,73,171,0.1), rgba(0,188,212,0.05))",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255,255,255,0.1)",
        glow: "0 0 20px rgba(57, 73, 171, 0.4)",
        "glow-gold": "0 0 20px rgba(249, 168, 37, 0.4)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
