# Everyday Decision Tools

A static Astro website with practical everyday cost calculators.

## Stack
- Astro static output
- Semantic HTML, CSS, and browser-side JavaScript
- No database, backend, login, or external runtime APIs
- Calculator values are processed in the browser

## Local development
```sh
npm ci
npm run dev
```

## Production build
```sh
npm run build
npm run preview
```

The generated site is written to `dist/`.

## Calculators
- Unit Price Calculator
- Gas Cost Calculator
- Subscription Cost Calculator
- Appliance Electricity Cost Calculator
- Repair or Replace Calculator

Calculator behavior is in `src/scripts/calculators.js`.
