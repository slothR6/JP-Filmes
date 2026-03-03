import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0b0f1a',
        card: '#151b2f',
        accent: '#f97316'
      }
    }
  },
  plugins: []
};

export default config;
