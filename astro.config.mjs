import { defineConfig, sessionDrivers } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://lcod.uk',
  prefetch: true,
  integrations: [sitemap()],
  session: {
    driver: sessionDrivers.lruCache(),
  },
  adapter: cloudflare(),
});
