# Quadcode Events Telegram Bot

Telegram bot and moderation panel for the Trading Traffic Meetup funnel.

## What It Does

- Runs the questionnaire flow shown in the reference screenshots.
- Saves completed applications to a JSON file on the VPS.
- Lets the team approve or disapprove applications in `/admin`.
- Optionally posts each new application to a Telegram moderation chat with inline buttons.
- Optionally syncs submitted/reviewed applications to Google Sheets.
- Optionally calls a CRM webhook with the same application payload.
- Sends the approved/disapproved message back to the applicant.

## How Lead Linking Works

The landing form generates an `event_lead_id` before submitting to CRM. The same
ID is included in the CRM payload and in the Telegram deep link:

```text
https://t.me/quadcode_events_bot?start=ttm_...
```

The bot stores that value as `event_lead_id`, so CRM, the bot admin panel, CSV
export, and Google Sheets all share one join key.

## Required Environment

```bash
TELEGRAM_BOT_TOKEN=123456:telegram-bot-token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
PORT=8080
HOST=127.0.0.1
```

## Optional Environment

```bash
PUBLIC_URL=https://events-bot.example.com
TELEGRAM_WEBHOOK_SECRET=random-secret-from-openssl
MODERATION_CHAT_ID=-1001234567890
MODERATOR_TELEGRAM_IDS=123456789,987654321
MODERATOR_USERNAME=moderator_iG
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
SHEETS_WEBHOOK_SECRET=random-secret-for-google-script
CRM_WEBHOOK_URL=https://crm-or-n8n.example.com/quadcode-events
CRM_WEBHOOK_SECRET=random-secret-for-crm-webhook
DATA_FILE=/var/lib/quadcode-events-bot/state.json
```

If `PUBLIC_URL` is set, the service registers `PUBLIC_URL/telegram/webhook` with Telegram on startup.
If `PUBLIC_URL` is not set, it uses Telegram long polling.

`MODERATION_CHAT_ID` can be a private admin chat ID or a group/channel ID. For a
private first test, use the moderator's Telegram chat ID.

## Run Locally

```bash
cd bot/trading-traffic-meetup
npm run check
TELEGRAM_BOT_TOKEN=... ADMIN_PASSWORD=... npm start
```

Admin panel:

```text
http://localhost:8080/admin
```

## VPS Deploy Sketch

1. Copy this folder to the corporate VPS.
2. Create a persistent data directory:

```bash
sudo mkdir -p /var/lib/quadcode-events-bot
sudo chown "$USER":"$USER" /var/lib/quadcode-events-bot
```

3. Start with polling first:

```bash
DATA_FILE=/var/lib/quadcode-events-bot/state.json \
TELEGRAM_BOT_TOKEN=... \
ADMIN_USERNAME=admin \
ADMIN_PASSWORD=... \
MODERATION_CHAT_ID=... \
MODERATOR_TELEGRAM_IDS=... \
npm start
```

4. Open the moderation panel through an SSH tunnel when running without a domain:

```bash
ssh -i ~/.ssh/artem_vps_ed25519 -L 8080:127.0.0.1:8080 artem@141.136.42.212
```

Then open `http://127.0.0.1:8080/admin`.

5. If the VPS later gets an HTTPS domain, keep `HOST=127.0.0.1`, put it behind
Nginx, set `PUBLIC_URL`, and restart. The service will set the webhook
automatically.

## Google Sheets Setup

1. Create a Google Sheet.
2. Open **Extensions -> Apps Script**.
3. Add the code from `google-apps-script/Code.gs`.
4. In Apps Script, set Script Property `WEBHOOK_SECRET`.
5. Deploy as **Web app** with access set to anyone who has the URL.
6. Put the deployment URL into `SHEETS_WEBHOOK_URL` and the same secret into `SHEETS_WEBHOOK_SECRET`.

The bot sends one flattened JSON object on each event:

- `submitted`
- `approved`
- `declined`

The Apps Script upserts rows by `application_id`, so approval changes update the
same row instead of creating duplicates.

## CRM Sync

CRM linking is already handled by `event_lead_id` in the initial landing payload.
If the CRM team provides an update endpoint or n8n scenario, set
`CRM_WEBHOOK_URL`; the bot will POST the same flattened application payload there
on submit and on moderation decisions. That webhook should update the existing
CRM lead by `event_lead_id`.

## Bot Flow

1. `/start`
2. Name and surname
3. Instagram link
4. Company
5. Position
6. Short experience and key cases
7. Pending moderation message

Approve text and disapprove text are configured in `src/server.js`.

## `.env` on VPS

`src/server.js` loads a local `.env` file automatically before reading config, so
the VPS process can be started with plain `npm start` or `nohup npm start`.
