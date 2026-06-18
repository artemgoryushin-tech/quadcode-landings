# Quadcode Affiliate World Asia Landing

Production landing page for booking Quadcode Brokerage Solutions booth meetings at Affiliate World Asia 2026. The root
project is a Vite + React app with Vercel serverless endpoints for lead capture.

## Development

```bash
corepack pnpm install
corepack pnpm dev
```

The Vite dev server runs the frontend. Vercel serves `api/leads.js` and `api/geo.js` in production.

## Lead Form

- CRM host: `FORMS_API_URL`, default `https://group.quadcode.com`
- CRM endpoint: `FORMS_API_ENDPOINT`, default `/api/notPopup`
- Dry-run mode: set `FORMS_API_DRY_RUN="true"` to validate form submission without sending a CRM lead.

The serverless endpoint forwards UTM fields, `roistat_visit`, language, page URL, meeting slot and visitor notes.

## Media

Original MP4 masters are not committed to `public`. Production clips live in `public/media` and are trimmed/compressed for web delivery.

## Existing Static Landings

The repository also keeps existing self-contained static landings under `vlp/`. They are preserved in this branch for
legacy paths and independent static deployments.
