/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional SaaS Dashboard Color System (HSL variables)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Cards/Surfaces
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',

        // Primary - Professional Blue
        primary: 'hsl(var(--primary))',
        'primary-hover': 'hsl(var(--primary-hover))',
        'primary-active': 'hsl(var(--primary-active))',
        'primary-soft': 'hsl(var(--primary-soft))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        'primary-light': 'hsl(var(--primary-light))',

        // Secondary
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',

        // Muted
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',

        // Accent - Indigo
        accent: 'hsl(var(--accent))',
        'accent-soft': 'hsl(var(--accent-soft))',
        'accent-foreground': 'hsl(var(--accent-foreground))',

        // Destructive/Error
        destructive: 'hsl(var(--destructive))',
        'destructive-soft': 'hsl(var(--destructive-soft))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',

        // Status colors
        success: 'hsl(var(--success))',
        'success-soft': 'hsl(var(--success-soft))',
        'success-foreground': 'hsl(var(--success-foreground))',

        warning: 'hsl(var(--warning))',
        'warning-soft': 'hsl(var(--warning-soft))',
        'warning-foreground': 'hsl(var(--warning-foreground))',

        // Borders and inputs
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Text colors
        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-muted': 'hsl(var(--text-muted))',

        // Surfaces
        surface: 'hsl(var(--surface))',
        'surface-secondary': 'hsl(var(--surface-secondary))',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.03)',
      },
      transitionDuration: {
        fast: '100ms',
        normal: '200ms',
        slow: '300ms',
      },
      height: {
        'input-sm': '36px',
        'input-md': '40px',
        'input-lg': '44px',
      },
    },
  },
  plugins: [],
}
