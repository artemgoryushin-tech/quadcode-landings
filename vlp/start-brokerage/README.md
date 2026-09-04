# Start Brokerage landing

`build.mjs` generates `index.html` from the Philippines base template and adds the English content, platform showcase, launch steps, Cal.com booking, and webinar preheader.

## Build and test

```bash
node vlp/start-brokerage/build.mjs
node --test api/start-brokerage-banner-experiment.test.js api/start-brokerage-cal-webhook.test.js
```

## Webinar banner experiment

The preheader tests three color variants: `graphite`, `red`, and `ivory`. New visitors are assigned a sticky color. The experiment records one impression per browser session and every CTA click.

When a Redis-compatible Vercel database is connected, the API uses Thompson Sampling after a 40-impression warm-up per color and keeps a 10% exploration rate. Without a database it safely falls back to a stable equal split; GTM events are still emitted.

Supported Vercel environment variable pairs:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- `UPSTASH_REDIS_REST_KV_REST_API_URL` and `UPSTASH_REDIS_REST_KV_REST_API_TOKEN` (Vercel Upstash integration with the `UPSTASH_REDIS_REST` prefix)
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`

GTM events:

- `start_brokerage_webinar_banner_impression`
- `start_brokerage_webinar_banner_click`

Both include `experiment_id`, `banner_variant`, `optimization_mode`, and `banner_destination`. Use `?bannerVariant=graphite`, `?bannerVariant=red`, or `?bannerVariant=ivory` to preview a color without recording an experiment impression.
