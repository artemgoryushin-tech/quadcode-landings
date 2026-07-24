# Quadcode Colombia — Audience to Broker

Bilingual Spanish / English B2B landing page for Colombian affiliates, IBs and trading-community owners considering their own brokerage brand.

## Development

```bash
corepack pnpm install
corepack pnpm dev
```

The Vite development server runs at `http://127.0.0.1:4173/es/`. English is available at `/en/`.

Local development uses CRM dry-run mode by default. To create a real test lead in the Quadcode CRM, start the landing explicitly in live CRM mode:

```bash
corepack pnpm dev:crm
```

Use `corepack pnpm preview:crm` to test a production build with live CRM forwarding. Live mode sends valid submissions to the configured CRM endpoint; use test contact details and stop the server when verification is complete.

## Lead handling

Production form submissions are sent to `/api/leads`, which validates and forwards the lead to the Quadcode CRM endpoint. Set `FORMS_API_DRY_RUN="true"` to validate requests without creating CRM leads.

The form source identifier is `quadcode_colombia_audience_to_broker` and includes locale, UTM/Roistat tracking, current business model, launch horizon and regulatory status.

## Content review

Before deployment, complete native Colombian Spanish review and legal/compliance review of all regulatory, availability, payment, KYC and launch statements.
