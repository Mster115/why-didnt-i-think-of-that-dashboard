import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Backgrounds
                bg: {
                    primary: '#000000',
                    secondary: '#0d0d0d',
                    tertiary: '#1a1a1a',
                    widget: '#0a0a0a',
                },
                // Accents
                accent: {
                    blue: '#3b82f6',
                    orange: '#f97316',
                    cyan: '#06b6d4',
                },
                // Semantic
                positive: '#22c55e',
                negative: '#ef4444',
                warning: '#eab308',
                neutral: '#6b7280',
                // Text
                text: {
                    primary: '#ffffff',
                    secondary: '#a1a1aa',
                    muted: '#71717a',
                },
                // Borders
                border: {
                    default: '#27272a',
                    bright: '#3f3f46',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
            },
            fontSize: {
                'xs': ['0.625rem', { lineHeight: '1rem' }],    // 10px - dense data
                'sm': ['0.75rem', { lineHeight: '1rem' }],     // 12px - labels
                'base': ['0.875rem', { lineHeight: '1.25rem' }], // 14px - body
                'lg': ['1rem', { lineHeight: '1.5rem' }],      // 16px - headers
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px - titles
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
};

export default config;
