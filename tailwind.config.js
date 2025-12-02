/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'deep-purple': '#2D0A31',
                'midnight-blue': '#0F172A',
                'blood-red': '#DC2626',
            },
            fontFamily: {
                cinzel: ['Cinzel', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'card-flip': 'cardFlip 0.8s ease-in-out',
                'fade-scale': 'fadeScale 0.6s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'shake': 'shake 0.5s ease-in-out',
                'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'death-fade': 'deathFade 1s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                cardFlip: {
                    '0%': { transform: 'perspective(1000px) rotateY(0deg)', opacity: '1' },
                    '50%': { transform: 'perspective(1000px) rotateY(90deg)', opacity: '0.5' },
                    '100%': { transform: 'perspective(1000px) rotateY(0deg)', opacity: '1' },
                },
                fadeScale: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                pulseGlow: {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)',
                        opacity: '1'
                    },
                    '50%': {
                        boxShadow: '0 0 40px rgba(220, 38, 38, 0.8)',
                        opacity: '0.8'
                    },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                },
                bounceIn: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                deathFade: {
                    '0%': { opacity: '1', filter: 'grayscale(0)' },
                    '100%': { opacity: '0.3', filter: 'grayscale(1)' },
                },
            },
        },
    },
    plugins: [],
}
