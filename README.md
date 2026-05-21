# Personal Site

A fast personal site for writings and drawings, built with [Astro](https://astro.build) + MDX. Articles can embed interactive maps (MapLibre) and charts (Observable Plot, D3).

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:4321 (Astro will print the actual URL).

## Build

```sh
npm run build
npm run preview
```

The static site is generated into `dist/`.

## Project layout

```
src/
  components/         shared UI (Nav, ThemeToggle, ArticleCard, Grid, viz/*)
  content/
    writings/        MDX articles
    drawings/        MDX entries for drawings
  layouts/           BaseLayout (nav + theme) and ArticleLayout (reading view)
  pages/             routes
  styles/global.css  theme variables (light/dark)
public/
  images/            cover & inline images (referenced as /images/<file>)
  data/              JSON for charts/maps
```

## Adding an article

Create a new file under `src/content/writings/your-slug.mdx`:

```mdx
---
title: "Title"
description: "Short description used on the homepage card and meta tags."
date: 2026-06-01
cover: "/images/your-cover.svg"
coverAlt: "Alt text for the cover image"
tags: ["data viz"]
draft: false
---

import PlotChart from '~/components/viz/PlotChart.astro';

Your prose here. Interactive components are imported and rendered inline.

<PlotChart id="my-chart" height={320} caption="Caption text." />

<script is:inline>
  (function () {
    function attach() {
      if (!window.registerPlot) return setTimeout(attach, 30);
      window.registerPlot('my-chart', function (Plot, _data, ctx) {
        return Plot.plot({
          width: ctx.width, height: ctx.height,
          marks: [Plot.barY([{ x: 'A', y: 3 }, { x: 'B', y: 7 }], { x: 'x', y: 'y' })],
        });
      });
    }
    attach();
  })();
</script>
```

Drawings work the same way, under `src/content/drawings/`.

## Viz islands

All three accept an `id` so multiple charts can live on the same page.

- **`<PlotChart id dataUrl? height? caption? />`** — Observable Plot. Register a render fn via `window.registerPlot(id, fn)` where `fn(Plot, data, ctx)` returns the result of `Plot.plot(...)`.
- **`<D3Chart id dataUrl? height? caption? />`** — D3. Register via `window.registerD3(id, fn)` where `fn(svg, data, ctx)` mutates the provided SVG selection. `ctx` includes `d3`, `width`, `height`.
- **`<MapView id lng lat zoom height? styleUrl? geojsonUrl? caption? />`** — MapLibre GL. Defaults to the free MapLibre demo style. For production, point `styleUrl` at MapTiler / Mapbox / Protomaps.

The islands re-render on resize and when the theme toggles, so charts pick up new colors automatically (use CSS vars like `var(--accent)` and `currentColor`).

## Theme

Light/dark toggle in the nav. Defaults to system preference, persists in `localStorage`, applied before paint to avoid flash. Theme variables are in [src/styles/global.css](src/styles/global.css).

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. Edit [astro.config.mjs](astro.config.mjs) and set `GH_USERNAME` to your GitHub username.
   - If your repo is named `personal-site`, leave `base` as `/personal-site` — the site lives at `https://<user>.github.io/personal-site`.
   - If your repo is named `<user>.github.io` (user/org root site), change `base` to `/`.
4. Push to `main`. The [deploy workflow](.github/workflows/deploy.yml) builds and publishes automatically.

## Image paths

Cover images referenced from frontmatter (`cover: "/images/foo.svg"`) get the base path prepended automatically. For **inline** images inside an MDX article, import them relatively so Astro processes the asset path correctly:

```mdx
import sketch from './sketch.svg';
<img src={sketch.src} alt="..." />
```

Don't hardcode `/images/foo.svg` in markdown — that won't pick up the GitHub Pages base path.
