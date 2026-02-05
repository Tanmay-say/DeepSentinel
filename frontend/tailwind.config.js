/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                colors: {
                        // DeepSentinel Deep Ocean Palette
                        page: '#050505',
                        'card-bg': 'rgba(10, 10, 10, 0.6)',
                        sidebar: '#080808',
                        glass: 'rgba(5, 5, 5, 0.7)',
                        primary: '#3B82F6',
                        secondary: '#06B6D4',
                        success: '#10B981',
                        warning: '#EAB308',
                        error: '#EF4444',
                        sui: '#4DA2FF',
                        'text-primary': '#F9FAFB',
                        'text-secondary': '#9CA3AF',
                        'text-muted': '#4B5563',
                        'border-subtle': 'rgba(255, 255, 255, 0.08)',
                        'border-highlight': 'rgba(59, 130, 246, 0.5)',
                        // Keep shadcn defaults
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': '#3B82F6',
                                '2': '#10B981',
                                '3': '#EAB308',
                                '4': '#EF4444',
                                '5': '#06B6D4'
                        }
                },
                fontFamily: {
                        heading: ['Chivo', 'sans-serif'],
                        body: ['Manrope', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                },
                backgroundImage: {
                        'hero-glow': 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                        'card-hover': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                },
                keyframes: {
                        'accordion-down': {
                                from: { height: '0' },
                                to: { height: 'var(--radix-accordion-content-height)' }
                        },
                        'accordion-up': {
                                from: { height: 'var(--radix-accordion-content-height)' },
                                to: { height: '0' }
                        },
                        'pulse-slow': {
                                '0%, 100%': { opacity: '1' },
                                '50%': { opacity: '0.5' }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};
