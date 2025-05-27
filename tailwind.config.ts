import type { Config } from 'tailwindcss';
import { tailwindColors } from '@/lib/tokens/semantic-colors';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Catch all src files
  ],
  theme: {
    extend: {
      colors: tailwindColors,
    },
  },
  plugins: [],
};

export default config;