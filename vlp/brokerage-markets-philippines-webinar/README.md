# Webinar: Best Markets to Launch a Brokerage in 2026

Two static, mobile-first pages with a Filipino/Taglish interface for the
Philippines webinar:

- `index.html` — registration landing page.
- `watch/index.html` — scheduled webinar room with synchronized video and chat.

The implementation uses plain HTML, CSS, and JavaScript with no build step or
runtime dependencies.

Presenter: **Dianne Guillergan**.

## Run locally

Serve the repository root over HTTP and open:

- `/vlp/brokerage-markets-philippines-webinar/`
- `/vlp/brokerage-markets-philippines-webinar/watch/`

The production registration endpoint is intentionally disabled on localhost.
For complete late-entry video QA, use a server that supports HTTP Range
requests; a basic static server may return the whole MP4 instead of `206
Partial Content`.

## Schedule

The scheduled session starts at `09:00 UTC`, which is `5:00 PM PHT`. The
registration page renders that same start in the visitor's browser timezone so
users outside the Philippines do not need to convert it manually. The public
copy does not say that the recording repeats daily.

The recording lasts 23:24. Before the start, the room shows a countdown and a
waiting state. At zero, playback starts automatically and muted. A late visitor
joins at the wall-clock position of the current session rather than at the
beginning. Pause, seeking, and playback-speed changes are blocked. After the
recording ends, the room changes to the next-session countdown.

## Video, transcript, and chat

The web-ready recording is `assets/webinar.mp4`: H.264/AAC, 720p, with the MP4
index moved to the beginning for progressive playback. The source transcript
and timed English captions are included as:

- `assets/webinar-transcript.txt`
- `assets/webinar.vtt`

The `CC` control toggles captions and remembers the preference locally.

`watch/chat-schedule.js` contains 295 timed messages. The opening city and
country prompt receives more than 100 varied responses, while later reactions
and questions follow the actual presentation topics. Eight Q&A messages are
aligned with the moments when the speaker answers those subjects. On late
entry, earlier chat is filled up to the current webinar second without replaying
the entire sequence.

For local QA only:

- `?liveAt=-300` — five minutes before the session.
- `?liveAt=600` — ten minutes after the session starts.
- `?liveAt=1450` — after the session ends.

These overrides work on `file://`, `localhost`, and `127.0.0.1`, and are
ignored on the production domain. That makes it possible to open
`watch/index.html?liveAt=5` directly from Finder to review the busiest opening
chat without starting a local server.

## Registration, CRM, and tracking

Production submissions use the existing Quadcode proxy:

`https://quadcode.foach.site/api/notPopup`

The payload preserves UTM data and includes the form answers, Telegram,
telephone country code, selected session, and personal watch URL. It uses:

- `source_form=quadcode_philippines_markets_webinar`
- `Registered Webinar` (`UF_CRM_1758615537942`)
- `Webinar Date / Time` (`UF_CRM_1760090758537`)
- `Webinar Access URL` (`UF_CRM_1786963871`)

The success state is shown only after the CRM request succeeds.

The page keeps the existing site-wide Google Tag Manager container
`GTM-KQ8QT66`; no new Meta Pixel ID is installed. After a successful submission,
`registration.js` dispatches `quadcode:webinar-register` and
`meta-registration.js` sends one `CompleteRegistration` event for that unique
registration ID with:

- `content_name`: `Best Markets to Launch a Brokerage in 2026`
- `content_category`: `Webinar`
- `event_date`: the selected session date

The room's attendance tracker counts only visible, actively playing live time
and uses the webinar key `brokerage_markets_philippines_daily`.

Server-side WhatsApp and email templates are not stored in this repository.
Before launch, the operations workflow must map the new webinar key/source form
to the correct English/Philippines confirmation, reminder, and live-link copy.

## Production route

`/vlp/brokerage-markets-philippines-webinar/`
