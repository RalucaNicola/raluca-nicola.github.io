import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// TODO: replace GH_USERNAME with your GitHub username before deploying.
// If you publish at <user>.github.io/personal-site, keep `base` as '/personal-site'.
// If you publish at <user>.github.io (root user-site repo), set base to '/'.
const GH_USERNAME = 'ralucanicola';
const REPO_NAME = 'personal-site';

export default defineConfig({
  site: `https://${GH_USERNAME}.github.io`,
  base: `/${REPO_NAME}`,
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
