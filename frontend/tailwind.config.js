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
                gold: {
                    400: '#E5C158',
                    500: '#D4AF37', // Main Gold
                    600: '#B59428',
                },
                dark: {
                    900: '#0a0a0a',
                    800: '#121212',
                    700: '#1c1c1c',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
