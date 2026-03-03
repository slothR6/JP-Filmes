import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: '#071018',
        'surface-alt': '#0b1722',
        panel: '#102231',
        'panel-strong': '#17364d',
        accent: '#f5b700',
        'accent-soft': '#ff6b35',
        ink: '#ecf4ff',
        muted: '#9cb4c8'
      },
      boxShadow: {
        glow: '0 30px 80px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
