export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink:    '#0A0E1A',
        navy:   '#111827',
        panel:  '#161D2E',
        card:   '#1C2539',
        border: '#2A3550',
        accent: '#4F8EF7',
        teal:   '#2DD4BF',
        rose:   '#F87171',
        muted:  '#64748B',
        soft:   '#94A3B8',
        light:  '#E2E8F0',
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'float':     'float 6s ease-in-out infinite',
        'pulse-slow':'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
}
