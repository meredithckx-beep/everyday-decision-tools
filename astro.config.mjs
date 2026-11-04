import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://decisionkit.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
});