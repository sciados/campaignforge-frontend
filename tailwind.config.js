/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        'apple': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Inter', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Apple Design System Colors
        apple: {
          black: '#000000',
          gray: '#86868B',
          'gray-light': '#F5F5F7',
          'gray-card': '#FAFAFA',
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          pink: '#FF2D92',
          yellow: '#FFCC00',
        },
        // Keep existing shadcn colors for compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
      },
      borderRadius: {
        // Apple Design System Border Radius
        'apple-sm': '8px',
        'apple-md': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
        'apple-2xl': '24px',
        // Keep existing values
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      spacing: {
        // Apple Design System Spacing
        'apple-xs': '4px',
        'apple-sm': '8px',
        'apple-md': '16px',
        'apple-lg': '24px',
        'apple-xl': '32px',
        'apple-2xl': '48px',
        'apple-3xl': '64px',
      },
      fontSize: {
        // Apple Typography Scale
        'apple-xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'apple-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'apple-base': ['16px', { lineHeight: '24px', letterSpacing: '0.01em' }],
        'apple-lg': ['18px', { lineHeight: '28px', letterSpacing: '0.01em' }],
        'apple-xl': ['20px', { lineHeight: '28px', letterSpacing: '0.01em' }],
        'apple-2xl': ['24px', { lineHeight: '32px', letterSpacing: '0.01em' }],
        'apple-3xl': ['30px', { lineHeight: '36px', letterSpacing: '0.01em' }],
        'apple-4xl': ['36px', { lineHeight: '40px', letterSpacing: '0.01em' }],
        'apple-5xl': ['48px', { lineHeight: '52px', letterSpacing: '0.01em' }],
        'apple-6xl': ['60px', { lineHeight: '64px', letterSpacing: '0.01em' }],
      },
      fontWeight: {
        // Apple Font Weights
        'apple-light': '300',
        'apple-regular': '400',
        'apple-medium': '500',
        'apple-semibold': '600',
        'apple-bold': '700',
      },
      boxShadow: {
        // Apple Design System Shadows
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'apple-md': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'apple-xl': '0 16px 64px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        // Apple-style animations
        'bounce-subtle': 'bounce-subtle 0.6s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        'apple': '20px',
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom Apple-style utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.apple-blur': {
          backdropFilter: 'blur(20px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        },
        '.apple-card': {
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E5E7',
        },
        '.apple-button': {
          backgroundColor: '#000000',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontWeight: '500',
          fontSize: '16px',
          lineHeight: '1.2',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        },
        '.apple-button:hover': {
          backgroundColor: '#1a1a1a',
          transform: 'translateY(-1px)',
        },
        '.apple-button:active': {
          transform: 'translateY(0)',
        },
        '.apple-input': {
          backgroundColor: '#F5F5F7',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '16px',
          lineHeight: '1.2',
          width: '100%',
          transition: 'all 0.2s ease',
        },
        '.apple-input:focus': {
          outline: 'none',
          backgroundColor: 'white',
          boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.2)',
        },
        '.text-apple-black': {
          color: '#000000',
        },
        '.text-apple-gray': {
          color: '#86868B',
        },
        '.bg-apple-light': {
          backgroundColor: '#F5F5F7',
        },
        '.bg-apple-card': {
          backgroundColor: '#FAFAFA',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}