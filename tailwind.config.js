/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-in-out",
        "fade-out": "fade-out 0.5s ease-in-out",
        "slide-in-bottom": "slide-in-bottom 0.5s ease-in-out",
        "slide-in-top": "slide-in-top 0.5s ease-in-out",
        "slide-in-left": "slide-in-left 0.5s ease-in-out",
        "slide-in-right": "slide-in-right 0.5s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "bounce-slow": "bounce 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "morph": "morph 8s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "tilt": "tilt 10s infinite linear",
        "theme-transition": "theme-transition 0.5s ease-in-out",
        "gradient-shift": "gradient-shift 10s ease infinite",
        "3d-rotate": "rotate3d 5s ease-in-out infinite",
        "scale-pulse": "scale-pulse 3s ease-in-out infinite",
        "float-shadow": "float-shadow 6s ease-in-out infinite",
        "text-flicker": "text-flicker 3s linear infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "blur-in": "blur-in 0.7s cubic-bezier(0.47, 0, 0.745, 0.715)",
        "pop-in": "pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "ripple": "ripple 1s cubic-bezier(0, 0.2, 0.8, 1)",
        "sweep-shine": "sweep-shine 2s ease infinite",
        "twinkle": "twinkle 2s ease-in-out infinite",
        "slide-up": "slide-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-in-top": {
          "0%": { transform: "translateY(-20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-20px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(20px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: 1,
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.7)"
          },
          "50%": {
            opacity: 0.7,
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
          },
        },
        "morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 60% 30% 70% / 40% 30% 70% 60%" },
          "75%": { borderRadius: "60% 40% 60% 30% / 60% 40% 20% 40%" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "tilt": {
          "0%, 50%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(1deg)",
          },
          "75%": {
            transform: "rotate(-1deg)",
          },
        },
        "theme-transition": {
          "0%": { 
            filter: "hue-rotate(0deg)",
          },
          "100%": {
            filter: "hue-rotate(360deg)",
          },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "rotate3d": {
          "0%": { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" },
          "50%": { transform: "perspective(1000px) rotateX(15deg) rotateY(15deg)" },
          "100%": { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" },
        },
        "scale-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "float-shadow": {
          "0%, 100%": {
            transform: "translateY(0)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          },
          "50%": {
            transform: "translateY(-10px)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          },
        },
        "text-flicker": {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": {
            opacity: "1",
            textShadow: "none"
          },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": {
            opacity: "0.5",
            textShadow: "0 0 4px rgba(255, 255, 255, 0.7)"
          },
        },
        "border-glow": {
          "0%, 100%": {
            borderColor: "rgba(59, 130, 246, 0.5)",
            boxShadow: "0 0 5px rgba(59, 130, 246, 0.2)"
          },
          "50%": {
            borderColor: "rgba(59, 130, 246, 1)",
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)"
          },
        },
        "blur-in": {
          "0%": { filter: "blur(12px)", opacity: 0 },
          "100%": { filter: "blur(0px)", opacity: 1 },
        },
        "pop-in": {
          "0%": { transform: "scale(0.8)", opacity: 0 },
          "40%": { transform: "scale(1.1)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: 1 },
          "100%": { transform: "scale(2)", opacity: 0 },
        },
        "sweep-shine": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "twinkle": {
          "0%, 100%": { opacity: 0.2, transform: "scale(0.8)" },
          "50%": { opacity: 1, transform: "scale(1.2)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.blue.400), 0 0 20px theme(colors.blue.700)',
        'neon-dark': '0 0 5px theme(colors.purple.400), 0 0 20px theme(colors.purple.700)',
        'inner-glow': 'inset 0 0 20px 0 rgba(59, 130, 246, 0.3)',
        'neo-light': '8px 8px 16px rgba(200, 200, 200, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.8)',
        'neo-dark': '8px 8px 16px rgba(10, 10, 10, 0.8), -8px -8px 16px rgba(40, 40, 40, 0.4)',
        'neo-pressed-light': 'inset 8px 8px 16px rgba(200, 200, 200, 0.4), inset -8px -8px 16px rgba(255, 255, 255, 0.8)',
        'neo-pressed-dark': 'inset 8px 8px 16px rgba(10, 10, 10, 0.8), inset -8px -8px 16px rgba(40, 40, 40, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      dropShadow: {
        'glow': '0 0 10px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 20px rgba(59, 130, 246, 0.7)',
        'text-neon': '0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shine': 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)',
        'gradient-circuit': "url('/images/circuit-pattern.svg')",
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-effect': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'rgba(255, 255, 255, 0.7)',
          'border-radius': '12px',
          'border': '1px solid rgba(209, 213, 219, 0.3)',
        },
        '.glass-effect-dark': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'rgba(17, 25, 40, 0.75)',
          'border-radius': '12px',
          'border': '1px solid rgba(255, 255, 255, 0.125)',
        },
        '.text-gradient-blue': {
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
          'background-image': 'linear-gradient(135deg, #3B82F6, #2DD4BF)',
        },
        '.text-gradient-sunset': {
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
          'background-image': 'linear-gradient(135deg, #F97316, #EC4899)',
        },
        '.perspective': {
          'perspective': '1000px',
        },
        '.perspective-1000': {
          'perspective': '1000px',
        },
        '.perspective-2000': {
          'perspective': '2000px',
        },
        '.perspective-3000': {
          'perspective': '3000px',
        },
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.neo-light': {
          'background': 'linear-gradient(145deg, #fcfcfc, #f0f0f0)',
          'border-radius': '15px',
        },
        '.neo-dark': {
          'background': 'linear-gradient(145deg, #1a1a1a, #252525)',
          'border-radius': '15px',
        },
        '.sweep-shine': {
          'position': 'relative',
          'overflow': 'hidden',
        },
        '.sweep-shine::after': {
          'content': '""',
          'position': 'absolute',
          'top': '-50%',
          'left': '-50%',
          'width': '200%',
          'height': '200%',
          'background': 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
          'transform': 'rotate(30deg)',
          'animation': 'sweep-shine 2s ease infinite',
          'pointer-events': 'none',
        },
        '.hover-card-3d': {
          'transition': 'transform 0.3s ease, box-shadow 0.3s ease',
        },
        '.hover-card-3d:hover': {
          'transform': 'translateY(-5px) perspective(1000px) rotateX(2deg) rotateY(2deg)',
          'box-shadow': '0 10px 20px rgba(0, 0, 0, 0.1)',
        },
      };
      addUtilities(newUtilities);
    },
    require("tailwindcss-animate"),
  ],
} 