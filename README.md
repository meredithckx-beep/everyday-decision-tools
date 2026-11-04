# Everyday Decision Tools

A small, static Astro website for practical everyday cost and purchase calculators.

## Stack

- Astro 5, static output
- Semantic HTML, CSS, and vanilla browser JavaScript
- No database, backend, login, or external runtime APIs
- Calculator values are processed in the browser only

## Local development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The generated static site is written to `dist/`.

## Before launch

1. Update `site` in `astro.config.mjs` and the URLs in `public/sitemap.xml` to the production domain you control.
2. Replace `hello@everydaydecisiontools.com` in the Contact and Privacy Policy pages with a monitored inbox.
3. Review the Privacy Policy against the actual hosting provider, server logs, analytics, and any future advertising integrations.
4. Submit `/sitemap.xml` to Google Search Console and Bing Webmaster Tools after deployment.

## Pages and calculators

- `/` — Homepage
- `/tools/` — Calculator directory
- `/tools/unit-price-calculator/`
- `/tools/cost-per-use-calculator/`
- `/tools/gas-cost-calculator/`
- `/tools/subscription-cost-calculator/`
- `/about/`, `/contact/`, `/privacy-policy/`
- `404.astro`, `public/robots.txt`, `public/sitemap.xml`

All calculator behavior is in `src/scripts/calculators.js`.
