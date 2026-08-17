# Brokerage Business in the Philippines webinar

Two connected static Quadcode pages:

- `index.html` — registration landing page.
- `watch/index.html` — on-demand recording player and session chat.

The current build is dependency-free HTML, CSS, and JavaScript. Registration,
viewing progress, and demo chat messages are stored in the browser so the full
flow can be reviewed before CRM, video, and chat services are connected.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173
```

Open:

- `http://127.0.0.1:4173/vlp/brokerage-business-philippines-webinar/`
- `http://127.0.0.1:4173/vlp/brokerage-business-philippines-webinar/watch/`

## Integration points

### Registration

`registration.js` validates the form and dispatches:

```js
window.addEventListener("quadcode:webinar-register", (event) => {
  // Send event.detail to the CRM or analytics layer.
});
```

The registration object is intentionally not placed in the page URL.

On `http`/`https`, `webinar-crm.js` sends the validated registration to the
existing Quadcode lead proxy:

`https://quadcode.foach.site/api/notPopup`

The request uses the existing Quadcode field contract (`first_name`, `email`,
`phone`, `tg`, `comment`, consent, UTM fields, and `roistat_id`) and requests
the Bitrix lead status `UC_SDFUX2` (`registered webinar`) through both
`status_id` and the canonical Bitrix `STATUS_ID` field. The visible `about`
and `whyJoin` answers are also sent as separate event fields and in the lead
comment. The payload also contains `session_time`, `webinar_url`, and
`access_url` for the confirmation email. File-protocol and localhost previews
skip the network request. After the lead endpoint accepts the registration,
the page replaces the form with a confirmation message and does not redirect.

The front end does not send email. In Bitrix, attach an email automation rule
to the `registered webinar` stage (`UC_SDFUX2`) and use the submitted email
plus the `webinar_url` value (or the same static watch URL) in the template.
The confirmation copy promises delivery by email, so this automation must be
enabled before the page goes live.

To change the endpoint or status without editing the integration module, set
this before `webinar-crm.js`:

```html
<script>
  window.QUADCODE_WEBINAR_CRM = {
    endpoint: "https://quadcode.foach.site/api/notPopup",
    statusId: "UC_SDFUX2",
    webinarUrl:
      "https://quadcode.com/vlp/brokerage-business-philippines-webinar/watch/",
  };
</script>
```

The mobile-first form collects work email, first name, phone number with a
country-code picker, an optional Telegram username, an about note, and a
separate reason for joining. The dispatched object includes the normalized
`phone`, `phoneCountry`, `about`, and `whyJoin` values; it keeps `lastName` and
`company` as empty strings and sets `country` to `Philippines`.

### Schedule and confirmation

`countdown.js` calculates the nearest 12:00 start in GMT+3 and updates the
mobile-first hero timer. The public page does not describe the recurrence.
After a successful submission, `registration.js` shows the submitted email,
the session time, and an inbox/spam-folder reminder.

### Launch toolkit

The registration page promises five downloadable resources:

- Brokerage business plan
- Launch checklist
- Brokerage marketing plan
- Profit calculator
- Top-GEO research

The current static prototype presents the offer but does not bundle the final
documents. Connect the download URLs to the CRM confirmation email or add them
to the watch page once the approved files are available.

### Video

Set `videoSrc` in `watch/index.html`:

```js
window.QUADCODE_WEBINAR = {
  videoSrc: "../assets/webinar-recording.mp4",
  durationSeconds: 3388,
  chatEndpoint: "",
};
```

When `videoSrc` is empty, the custom player runs in preview mode without
requesting a missing media file.

The room reuses the registration page’s light Quadcode background, typography,
red accents, and surface styles. Desktop keeps the video and chat side by side;
the mobile DOM order is video, chat, then the consultation follow-up.

### Chat

Set `chatEndpoint` to a POST endpoint. The page sends JSON with:

- `id`
- `text`
- `sentAt`
- `viewer.name`
- `viewer.email`
- `viewer.company`

The page also dispatches `quadcode:webinar-chat-send` for tag-manager or custom
integration. Without an endpoint, messages remain local to the browser and the
UI states that clearly.

## Deployment path

The files are ready for the Quadcode static path:

`/vlp/brokerage-business-philippines-webinar/`

The public watch page includes `noindex, nofollow` because it is intended to sit
after registration.
