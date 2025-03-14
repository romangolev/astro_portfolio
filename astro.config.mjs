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

  markdown: {
    shikiConfig: {
      // Choose the theme for syntax highlighting
      theme: 'github-dark',
    },
  },
});