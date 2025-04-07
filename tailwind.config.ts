import type { Config } from 'tailwindcss';
import { tailwindColors } from './src/lib/ui/tokens/colors';

const config: Config = {
  content: {
    files: ['./src/**/*.{ts,tsx}', './src/styles/theme-safelist.css'],
  },
  theme: {
    extend: {
      colors: tailwindColors,
    },
  },
  plugins: [],
};

export default config;