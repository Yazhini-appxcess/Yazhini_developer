import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--primary-rgb, 1 40 78) / <alpha-value>)",
                secondary: {
                    50: '#f1f5f9',
                    100: '#e2e8f0',
                    200: '#cbd5e1',
                    300: '#94a3b8',
                    400: '#8198b3',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                "background-light": "#ffffff",
                "background-dark": "#0f172a",
                "accent-emerald": "#10b981",
                "accent-violet": "#8b5cf6",
                "accent-amber": "#f59e0b",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.75rem",
                'xl': '1rem',
                '2xl': '1.5rem',
            },
        },
    },
    plugins: [
        typography,
        forms,
    ],
};
export default config;
