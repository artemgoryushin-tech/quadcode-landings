# Webinar: Can You Vibe Code a Brokerage?

Two static, mobile-first English pages:

- `index.html` — registration landing page with a mobile bottom-sheet form.
- `watch/index.html` — scheduled webinar room with synchronized video and chat.

The implementation uses plain HTML, CSS, and JavaScript with no build step.
Presenter: **Mila Vidakovic**, Business Development Manager.

## Local preview

Serve the repository root over HTTP and open:

- `/vlp/vibecode-brokerage-webinar/`
- `/vlp/vibecode-brokerage-webinar/watch/`

Production registration is disabled on localhost. The room supports local-only
timeline overrides:

- `?liveAt=-300` — five minutes before the session.
- `?liveAt=25` — opening audio/video check and active chat.
- `?liveAt=600` — the screen-visibility exchange.
- `?liveAt=1450` — demo invitation and questions.
- `?liveAt=1580` — after the recording ends.

## Schedule and playback

The session starts at `13:00 UTC` (`3:00 PM CEST`). The public page renders the
same start in the visitor's local timezone and does not describe the daily
recurrence.

The recording lasts 26:15. Before start, the room shows a countdown. At zero,
playback starts automatically and muted. A late visitor joins at the current
wall-clock point. Seeking, pause, and playback-speed changes are blocked. After
the recording ends, the room shows the countdown to the next session.

## Media and chat

`assets/webinar.mp4` is an optimized H.264/AAC 720p export with `faststart`.
The transcript and timed English captions are in:

- `assets/webinar-transcript.txt`
- `assets/webinar.vtt`

`watch/chat-schedule.js` contains synchronized English attendee activity. The
opening clusters follow Mila's audio/video and audience-background prompts;
later messages track GEO choice, operations, infrastructure, pricing, demo, and
the two connection interruptions in the recording.

## Registration and analytics

Production submissions use the existing Quadcode proxy:

`https://quadcode.foach.site/api/notPopup`

The CRM payload preserves attribution and sends the answers, Telegram, phone
country, selected session, and personal watch URL. It uses:

- `source_form=quadcode_vibecode_brokerage_webinar`
- `Registered Webinar` (`UF_CRM_1758615537942`)
- `Webinar Date / Time` (`UF_CRM_1760090758537`)
- `Webinar Access URL` (`UF_CRM_1786963871`)

The existing `GTM-KQ8QT66` container remains unchanged. After a successful CRM
submission, `meta-registration.js` sends one `CompleteRegistration` event for
the registration ID with `content_name=Can You Vibe Code a Brokerage?`.

The room keeps the attendance contract: `room_opened`, `joined`, cumulative
30-second heartbeats, visibility/video-playing checks, and `leave`. Its webinar
key is `vibecode_brokerage_daily`. The attendance backend must map this new key
and source form before launch.

## Production URLs

- `https://quadcode.com/vlp/vibecode-brokerage-webinar/`
- `https://quadcode.com/vlp/vibecode-brokerage-webinar/watch/`
