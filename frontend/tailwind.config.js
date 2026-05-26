/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',      // Background: #0f172a
        darkCard: '#111827',    // Card: #111827
        brandPrimary: '#6366f1',// Primary: #6366f1
        brandAccent: '#06b6d4', // Accent: #06b6d4
        brandSuccess: '#10b981',// Success: #10b981
        brandDanger: '#ef4444', // Danger: #ef4444
        brandText: '#f8fafc',   // Text: #f8fafc
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        neonIndigo: '0 0 15px rgba(99, 102, 241, 0.5)',
        neonCyan: '0 0 15px rgba(6, 182, 212, 0.5)',
      }
    },
  },
  plugins: [],
}
