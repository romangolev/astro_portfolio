// @ts-check
import { defineConfig } from 'astro/config';
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// // Determine if we're in a GitHub Pages environment
// const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
// const basePath = isGitHubPages ? '/astro_portfolio/' : '/';

// console.log("Base path for config:", basePath);

export default defineConfig({
  base: '',
  integrations: [],

  // Listen on all interfaces so the dev server is reachable over the LAN and
  // Tailscale. allowedHosts covers the MagicDNS / mDNS names, since Vite only
  // accepts raw IPs and localhost by default.
  server: {
    host: true,
    allowedHosts: ['omarchy.taile6e85f.ts.net', 'omarchy.local'],
  },

  markdown: {
    shikiConfig: {
      // Dual themes so code reads well in both light and dark mode
      themes: { light: 'github-light-high-contrast', dark: 'github-dark' },
    },
  },
});