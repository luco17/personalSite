import { defineConfig, sessionDrivers } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://lcod.uk',
  prefetch: true,
  integrations: [sitemap({
    filter: (page) => new URL(page).pathname !== '/links/',
  })],
  session: {
    driver: sessionDrivers.lruCache(),
  },
  // All current images belong to static pages: resize once at build time.
  adapter: cloudflare({ imageService: 'compile' }),
});
