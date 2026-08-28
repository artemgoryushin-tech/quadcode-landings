# User research interview landing

Landing URL: `/vlp/user-interview/`

## Google Sheets connection

Target sheet: `Quadcode — User Interview Applications`

1. In the Google Sheet, open **Extensions → Apps Script** and paste `google-apps-script/Code.gs`.
2. In Apps Script, add a Script Property named `WEBHOOK_SECRET` with a long random value.
3. Deploy the script as a **Web app**, execute as yourself, and allow access to anyone with the URL.
4. Add the deployment URL and the same secret to Vercel:

```text
USER_INTERVIEW_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
USER_INTERVIEW_SHEETS_WEBHOOK_SECRET=...
```

Optional variables:

- `RECAPTCHA_SECRET_KEY` — verifies the reCAPTCHA token server-side.
- `USER_INTERVIEW_DRY_RUN=true` — tests form handling without writing to Sheets.

The public page sends data only to the same-origin serverless endpoint. The Google webhook URL and secret stay server-side.
