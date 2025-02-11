// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  base: '/astro_portfolio/',
  // site: 'https://www.romangolev.com',
  integrations: [],

  vite: {
    define: {
      'import.meta.env.BASE_URL': JSON.stringify('/astro_portfolio/'),
    },
  },
});