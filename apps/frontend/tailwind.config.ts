import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
