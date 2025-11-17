/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.{js,ts,tsx}', './app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  // Enable dark mode with 'class' strategy for manual control
  darkMode: 'class',

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary purple colors
        primary: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#6d28d9',
        },
        // Light mode colors
        light: {
          background: '#faf5ff',
          card: '#ffffff',
          text: '#1f2937',
          'text-secondary': '#6b7280',
          border: '#e5e7eb',
        },
        // Dark mode colors
        dark: {
          background: '#111827',
          'background-secondary': '#1f2937',
          card: '#374151',
          text: '#f9fafb',
          'text-secondary': '#9ca3af',
          border: '#4b5563',
        },
      },
    },
  },
  plugins: [],
};
