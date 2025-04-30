import type { Config } from 'tailwindcss';
import { tailwindColors } from '@ui-tokens/semantic-colors';

const config: Config = {
  // content: {
  //   files: ['./src/**/*.{ts,tsx}', './src/styles/theme-safelist.css'],
  // },
  theme: {
    extend: {
      colors: tailwindColors,
    },
  },
  plugins: [],
};

export default config;