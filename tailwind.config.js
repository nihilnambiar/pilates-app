/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fdf6f5',
          100: '#f9e8e6',
          200: '#f3cdc8',
          300: '#e9a9a0',
          400: '#db7d70',
          500: '#c85a49',
          600: '#b04538',
          700: '#93372c',
          800: '#7a3029',
          900: '#672d26',
        },
        sage: {
          50: '#f2f7f4',
          100: '#e0ede5',
          200: '#c2dacc',
          300: '#98c0a8',
          400: '#67a07f',
          500: '#458361',
          600: '#32684c',
          700: '#29543e',
          800: '#234433',
          900: '#1d382b',
        },
        cream: {
          50: '#fefcf7',
          100: '#fdf5e8',
          200: '#fae8c8',
          300: '#f5d49a',
          400: '#efba60',
          500: '#e9a032',
          600: '#da8420',
          700: '#b5681a',
          800: '#92521c',
          900: '#77441a',
        },
        stone: {
          warm: '#f5f0eb',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #fdf6f5 0%, #f0e6e8 30%, #e8eef0 60%, #f5f0eb 100%)',
        'gradient-rose': 'linear-gradient(135deg, #fce4e1 0%, #f9d4e0 50%, #ede8f4 100%)',
        'gradient-sage': 'linear-gradient(135deg, #e8f0ec 0%, #d4e6da 100%)',
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(200, 90, 73, 0.08)',
        'card': '0 4px 30px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.1)',
        'glow': '0 0 30px rgba(200, 90, 73, 0.2)',
        'glow-sage': '0 0 30px rgba(69, 131, 97, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
