/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#e8fafa',
          100: '#c5f1f1',
          200: '#8de3e3',
          300: '#55d4d4',
          400: '#3babad',
          500: '#2e8e90',
          600: '#237173',
          700: '#185456',
          800: '#0d3839',
          900: '#061c1d',
        },
        purple: {
          50:  '#f3e7fd',
          100: '#e0c0fb',
          200: '#c17ff7',
          300: '#a23ff3',
          400: '#8a13e9',
          500: '#6e0fba',
          600: '#530b8c',
          700: '#38075d',
          800: '#1d042f',
          900: '#0e0217',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
