import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050505',
          900: '#08080a',
          850: '#0d0d11',
          800: '#14141a',
        },
      },
      boxShadow: {
        'crisp-card': '0 1px 2px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'btn-highlight': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
