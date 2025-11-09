module.exports = {
  content: [
    "./pages/*.{html,js}",
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        
        primary: {
          DEFAULT: "#1e40af",
          50: "#eff6ff", 
          100: "#dbeafe", 
          500: "#3b82f6", 
          600: "#2563eb", 
          700: "#1d4ed8",
          800: "#1e40af", 
          900: "#1e3a8a",
        },
        
        
        secondary: {
          DEFAULT: "#64748b",
          50: "#f8fafc", 
          100: "#f1f5f9", 
          200: "#e2e8f0", 
          300: "#cbd5e1",
          400: "#94a3b8", 
          500: "#64748b", 
          600: "#475569", 
          700: "#334155", 
          800: "#1e293b", 
          900: "#0f172a", 
        },
        
       
        accent: {
          DEFAULT: "#f59e0b", 
          50: "#fffbeb", 
          100: "#fef3c7", 
          200: "#fde68a", 
          400: "#fbbf24", 
          500: "#f59e0b", 
          600: "#d97706", 
          700: "#b45309", 
        },
        
        
        background: "#f8fafc", 
        surface: "#ffffff", 
        
        
        text: {
          primary: "#1e293b",
          secondary: "#64748b", 
          muted: "#94a3b8", 
        },
        
        
        success: {
          DEFAULT: "#059669", 
          50: "#ecfdf5", 
          100: "#d1fae5", 
          500: "#10b981", 
          600: "#059669", 
          700: "#047857", 
        },
        
        warning: {
          DEFAULT: "#d97706", 
          50: "#fffbeb", 
          100: "#fef3c7", 
          500: "#f59e0b", 
          600: "#d97706", 
          700: "#b45309",
        },
        
        error: {
          DEFAULT: "#dc2626", 
          50: "#fef2f2", 
          100: "#fee2e2", 
          500: "#ef4444", 
          600: "#dc2626", 
          700: "#b91c1c", 
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        jetbrains: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'modal': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
      
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  corePlugins: {
    preflight: true,
  },
}