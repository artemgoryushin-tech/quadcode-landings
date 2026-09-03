import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_FORMS_API_URL = "https://quadcode.foach.site";
const DEFAULT_FORMS_API_ENDPOINT = "/api/notPopup";
const CAL_EVENT_TYPE_SLUG = "quadcode-meeting";
const CAL_EVENT_TYPE_ID = 394995;
const SOURCE_FORM = "quadcode_start_brokerage";
const SOURCE_SITE = "Quadcode Brokerage Solutions";
const LANDING_URL = "https://quadcode.com/vlp/start-brokerage/";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export const config = {
  api: {
    bodyParser: false,
  },
};

function readHeader(request, name) {
  const headers = request.headers;
  if (headers && typeof headers.get === "function") {
    const value = headers.get(name);
    if (typeof value === "string" && value) return value;
  }

  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  if (Array.isArray(value) && value[0]) return value[0];
  if (typeof value === "string" && value) return value;

  if (headers && typeof headers === "object") {
    const caseInsensitiveValue = Object.entries(headers).find(
      ([key]) => key.toLowerCase() === name.toLowerCase(),
    )?.[1];
    if (Array.isArray(caseInsensitiveValue) && caseInsensitiveValue[0]) return caseInsensitiveValue[0];
    if (typeof caseInsensitiveValue === "string") return caseInsensitiveValue;
  }

  if (Array.isArray(request.rawHeaders)) {
    for (let index = 0; index < request.rawHeaders.length; index += 2) {
      if (String(request.rawHeaders[index]).toLowerCase() === name.toLowerCase()) {
        return String(request.rawHeaders[index + 1] || "");
      }
    }
  }

  return "";
}

async function readRawBody(request) {
  const chunks = [];
  if (request && typeof request[Symbol.asyncIterator] === "function") {
    for await (const chunk of request) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  }
  if (chunks.length) return Buffer.concat(chunks);

  // Vercel exposes request.body through a lazy parsing getter. Accessing that
  // getter before consuming the request stream discards the exact bytes Cal
  // signed, so only use the parsed-body fallback when no stream was available.
  const parsedBody = request.body;
  if (Buffer.isBuffer(parsedBody)) return parsedBody;
  if (typeof parsedBody === "string") return Buffer.from(parsedBody);
  if (parsedBody && typeof parsedBody === "object") {
    return Buffer.from(JSON.stringify(parsedBody));
  }
  return Buffer.alloc(0);
}

function verifySignature(rawBody, signature, secret) {
  const normalizedSignature = signature.trim().replace(/^sha256=/i, "");
  if (!/^[a-f\d]{64}$/i.test(normalizedSignature)) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(normalizedSignature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function normalizeIdentifier(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function formatValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if ("label" in value && typeof value.label === "string") return value.label.trim();
    if ("optionValue" in value && typeof value.optionValue === "string") return value.optionValue.trim();
    if ("value" in value) return formatValue(value.value);
    return JSON.stringify(value).slice(0, 1200);
  }
  return String(value).trim().slice(0, 1500);
}

function responseValue(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return formatValue(entry);
  if ("response" in entry) return formatValue(entry.response);
  if ("value" in entry) return formatValue(entry.value);
  return formatValue(entry);
}

function responseEntries(payload) {
  const merged = {
    ...(payload.customInputs && typeof payload.customInputs === "object" ? payload.customInputs : {}),
    ...(payload.responses && typeof payload.responses === "object" ? payload.responses : {}),
    ...(payload.userFieldsResponses && typeof payload.userFieldsResponses === "object" ? payload.userFieldsResponses : {}),
  };

  return Object.entries(merged).map(([key, entry]) => ({
    key,
    label: entry && typeof entry === "object" && typeof entry.label === "string" ? entry.label : key,
    value: responseValue(entry),
  }));
}

function findResponse(entries, patterns) {
  const normalizedPatterns = patterns.map(normalizeIdentifier);
  const match = entries.find(({ key, label }) => {
    const identifiers = [normalizeIdentifier(key), normalizeIdentifier(label)];
    return normalizedPatterns.some((pattern) => identifiers.some((identifier) => identifier.includes(pattern)));
  });
  return match?.value || "";
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return "";
  return `+${digits}`;
}

function metadataValue(metadata, key) {
  if (!metadata || typeof metadata !== "object") return "";
  return formatValue(metadata[key] ?? metadata[`metadata[${key}]`]);
}

function landingReference(sourceUrl) {
  if (!sourceUrl) return "quadcode.com/vlp/start-brokerage/";
  try {
    const url = new URL(sourceUrl);
    return `${url.host}${url.pathname}`;
  } catch {
    return "quadcode.com/vlp/start-brokerage/";
  }
}

export function buildCrmPayloadFromBooking(payload) {
  const entries = responseEntries(payload);
  const attendee = Array.isArray(payload.attendees) && payload.attendees.length ? payload.attendees[0] : {};
  const name = formatValue(attendee.name) || findResponse(entries, ["name"]);
  const email = formatValue(attendee.email) || findResponse(entries, ["email"]);
  const phone = normalizePhone(
    attendee.phoneNumber || findResponse(entries, ["attendeePhoneNumber", "phoneNumber", "phone"]),
  );
  const about = findResponse(entries, ["tellAboutYourself", "aboutYourself", "currentBusiness"]);
  const launchReason = findResponse(entries, ["whyDoYouWantToLaunchYourBrokerage", "launchGoal", "whyBrokerage"]);
  const notes = formatValue(payload.additionalNotes) || findResponse(entries, ["notes"]);
  const metadata = payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {};
  const sourceUrl = metadataValue(metadata, "source_url") || LANDING_URL;
  const pagePath = metadataValue(metadata, "landing_path") || "/vlp/start-brokerage/";
  const language = formatValue(attendee.language?.locale) || "en";

  const systemResponseKeys = new Set([
    "name",
    "email",
    "attendeephonenumber",
    "phonenumber",
    "phone",
    "location",
    "title",
    "notes",
    "guests",
    "reschedulereason",
  ]);
  const customAnswers = entries
    .filter(({ key, value }) => value && !systemResponseKeys.has(normalizeIdentifier(key)))
    .map(({ label, value }) => `${label}: ${value}`);

  const meetingContext = [
    `${SOURCE_SITE} lead`,
    "Request type: Cal meeting booking",
    `Cal booking UID: ${formatValue(payload.uid)}`,
    `Cal event type: ${formatValue(payload.type) || CAL_EVENT_TYPE_SLUG}`,
    payload.eventTypeId ? `Cal event type ID: ${payload.eventTypeId}` : "",
    payload.status ? `Booking status: ${formatValue(payload.status)}` : "",
    payload.startTime ? `Meeting start: ${formatValue(payload.startTime)}` : "",
    payload.endTime ? `Meeting end: ${formatValue(payload.endTime)}` : "",
    attendee.timeZone ? `Booker timezone: ${formatValue(attendee.timeZone)}` : "",
    phone ? `Phone: ${phone}` : "",
    ...customAnswers,
    notes && !customAnswers.some((line) => line.endsWith(notes)) ? `Additional notes: ${notes}` : "",
    `Landing language: ${language}`,
    `Page: ${pagePath}`,
    `Source URL: ${sourceUrl}`,
    ...UTM_FIELDS.map((field) => {
      const value = metadataValue(metadata, field) || formatValue(payload[field]);
      return value ? `${field}: ${value}` : "";
    }),
  ].filter(Boolean);

  const text = [
    about ? `About: ${about}` : "",
    launchReason ? `Launch goal: ${launchReason}` : "",
    notes ? `Notes: ${notes}` : "",
  ].filter(Boolean).join("\n") || "Booked a Quadcode brokerage consultation through Cal.eu.";

  const crmPayload = {
    name,
    first_name: name,
    email,
    phone,
    tg: "",
    text,
    message: meetingContext.join("\n"),
    agreement: true,
    terms_agree: true,
    agreement_source: "Cal.eu booking submission",
    landing_url: sourceUrl,
    referrer: landingReference(sourceUrl),
    language,
    lang_by_browser: language,
    source_form: SOURCE_FORM,
    source_site: SOURCE_SITE,
    comment: meetingContext.join("\n"),
    external_id: formatValue(payload.uid),
    cal_booking_uid: formatValue(payload.uid),
    cal_event_type_id: String(payload.eventTypeId || ""),
    cal_booking_start: formatValue(payload.startTime),
    cal_booking_end: formatValue(payload.endTime),
    cal_booking_status: formatValue(payload.status),
  };

  for (const field of UTM_FIELDS) {
    const value = metadataValue(metadata, field) || formatValue(payload[field]);
    if (value) crmPayload[field] = value;
  }

  return crmPayload;
}

function parseCrmResponse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ success: false, message: "Method not allowed." });
  }

  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CAL_WEBHOOK_SECRET is not configured");
    return response.status(503).json({ success: false, message: "Webhook is not configured." });
  }

  const rawBody = await readRawBody(request);
  const signature = readHeader(request, "x-cal-signature-256");
  if (!rawBody.length || !verifySignature(rawBody, signature, secret)) {
    const normalizedSignature = signature.trim().replace(/^sha256=/i, "");
    console.warn("Cal webhook signature rejected", {
      signaturePresent: Boolean(signature),
      signatureLength: normalizedSignature.length,
      secretLength: secret.length,
      rawBodyLength: rawBody.length,
      rawBodyFingerprint: createHash("sha256").update(rawBody).digest("hex").slice(0, 12),
      expectedSignaturePrefix: rawBody.length
        ? createHmac("sha256", secret).update(rawBody).digest("hex").slice(0, 12)
        : "",
      receivedSignaturePrefix: normalizedSignature.slice(0, 12),
    });
    return response.status(401).json({ success: false, message: "Invalid webhook signature." });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return response.status(400).json({ success: false, message: "Invalid JSON payload." });
  }

  if (event.triggerEvent !== "BOOKING_CREATED") {
    return response.status(204).end();
  }

  const booking = event.payload;
  if (!booking || typeof booking !== "object") {
    return response.status(400).json({ success: false, message: "Booking payload is missing." });
  }

  const expectedEvent = booking.type === CAL_EVENT_TYPE_SLUG || Number(booking.eventTypeId) === CAL_EVENT_TYPE_ID;
  if (!expectedEvent) {
    return response.status(204).end();
  }

  const crmPayload = buildCrmPayloadFromBooking(booking);
  if (!crmPayload.name || !crmPayload.email || !crmPayload.cal_booking_uid) {
    return response.status(422).json({ success: false, message: "Required booking contact data is missing." });
  }

  if (process.env.FORMS_API_DRY_RUN === "true") {
    return response.status(200).json({ success: true, bookingUid: crmPayload.cal_booking_uid });
  }

  const endpoint = process.env.QUADCODE_LEADS_API_URL ?? new URL(
    process.env.FORMS_API_ENDPOINT ?? DEFAULT_FORMS_API_ENDPOINT,
    process.env.FORMS_API_URL ?? DEFAULT_FORMS_API_URL,
  ).toString();
  const crmFormData = new FormData();
  for (const [key, value] of Object.entries(crmPayload)) {
    if (value === true) crmFormData.set(key, "on");
    else if (value !== false && value !== null && value !== undefined && value !== "") {
      crmFormData.set(key, String(value));
    }
  }
  try {
    const crmResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest",
        "Idempotency-Key": crmPayload.cal_booking_uid,
      },
      body: crmFormData,
      cache: "no-store",
    });
    const responseText = await crmResponse.text();
    const result = parseCrmResponse(responseText);
    const rejectedByBody = result && typeof result === "object" && (
      result.success === false || result.status === "error" || result.error === true
    );

    if (!crmResponse.ok || rejectedByBody) {
      console.error("CRM rejected Cal booking", {
        status: crmResponse.status,
        bookingUid: crmPayload.cal_booking_uid,
      });
      return response.status(502).json({ success: false, message: "CRM rejected the booking lead." });
    }

    return response.status(200).json({ success: true, bookingUid: crmPayload.cal_booking_uid });
  } catch {
    return response.status(502).json({ success: false, message: "CRM is temporarily unavailable." });
  }
}
