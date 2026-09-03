import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { Readable } from "node:stream";
import test from "node:test";
import handler, { buildCrmPayloadFromBooking } from "./start-brokerage-cal-webhook.js";

const booking = {
  type: "quadcode-meeting",
  eventTypeId: 394995,
  uid: "cal-booking-123",
  status: "ACCEPTED",
  startTime: "2026-09-10T10:00:00Z",
  endTime: "2026-09-10T10:15:00Z",
  attendees: [
    {
      name: "Ada Lovelace",
      email: "ada@example.com",
      phoneNumber: "+44 7700 900123",
      timeZone: "Europe/London",
      language: { locale: "en" },
    },
  ],
  responses: {
    name: { label: "Your name", value: "Ada Lovelace" },
    email: { label: "Email address", value: "ada@example.com" },
    attendeePhoneNumber: { label: "Phone number", value: "+44 7700 900123" },
    "Tell-about-yourself": { label: "Tell about yourself", value: "I run a fintech marketing team." },
    "Why-do-you-want-to-launch-your-brokerage": {
      label: "Why do you want to launch your brokerage?",
      value: "To serve clients in the UK.",
    },
  },
  metadata: {
    source_form: "quadcode_start_brokerage",
    landing_path: "/vlp/start-brokerage/",
    source_url: "https://quadcode.com/vlp/start-brokerage/?utm_source=google",
    utm_source: "google",
    utm_campaign: "brokerage-search",
  },
};

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

function createRequest(rawBody, signature, useWebHeaders = false) {
  const request = Readable.from([rawBody]);
  request.method = "POST";
  request.headers = useWebHeaders
    ? new Headers({ "x-cal-signature-256": signature })
    : { "x-cal-signature-256": signature };
  return request;
}

function addParsedBodyGuard(request) {
  Object.defineProperty(request, "body", {
    configurable: true,
    get() {
      throw new Error("Parsed request.body must not be read before the raw stream.");
    },
  });
  return request;
}

test("maps the live Quadcode Cal questions to the existing CRM contract", () => {
  const payload = buildCrmPayloadFromBooking(booking);

  assert.equal(payload.name, "Ada Lovelace");
  assert.equal(payload.email, "ada@example.com");
  assert.equal(payload.phone, "+447700900123");
  assert.equal(payload.source_form, "quadcode_start_brokerage");
  assert.equal(payload.cal_booking_uid, "cal-booking-123");
  assert.equal(payload.utm_source, "google");
  assert.match(payload.text, /I run a fintech marketing team/);
  assert.match(payload.text, /serve clients in the UK/);
  assert.match(payload.comment, /Meeting start: 2026-09-10T10:00:00Z/);
});

test("accepts a signed BOOKING_CREATED webhook in dry-run mode", async () => {
  const previousSecret = process.env.CAL_WEBHOOK_SECRET;
  const previousDryRun = process.env.FORMS_API_DRY_RUN;
  process.env.CAL_WEBHOOK_SECRET = "test-cal-secret";
  process.env.FORMS_API_DRY_RUN = "true";

  try {
    const rawBody = JSON.stringify({ triggerEvent: "BOOKING_CREATED", payload: booking });
    const signature = createHmac("sha256", process.env.CAL_WEBHOOK_SECRET).update(rawBody).digest("hex");
    const response = createResponse();

    await handler(addParsedBodyGuard(createRequest(rawBody, signature, true)), response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { success: true, bookingUid: "cal-booking-123" });
  } finally {
    if (previousSecret === undefined) delete process.env.CAL_WEBHOOK_SECRET;
    else process.env.CAL_WEBHOOK_SECRET = previousSecret;
    if (previousDryRun === undefined) delete process.env.FORMS_API_DRY_RUN;
    else process.env.FORMS_API_DRY_RUN = previousDryRun;
  }
});

test("rejects a webhook with an invalid signature", async () => {
  const previousSecret = process.env.CAL_WEBHOOK_SECRET;
  process.env.CAL_WEBHOOK_SECRET = "test-cal-secret";

  try {
    const rawBody = JSON.stringify({ triggerEvent: "BOOKING_CREATED", payload: booking });
    const response = createResponse();

    await handler(createRequest(rawBody, "0".repeat(64)), response);

    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.body, { success: false, message: "Invalid webhook signature." });
  } finally {
    if (previousSecret === undefined) delete process.env.CAL_WEBHOOK_SECRET;
    else process.env.CAL_WEBHOOK_SECRET = previousSecret;
  }
});
