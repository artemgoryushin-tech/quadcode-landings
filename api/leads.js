import { isSupportedCountry, parsePhoneNumber } from "libphonenumber-js/min";

const DEFAULT_FORMS_API_URL = "https://group.quadcode.com";
const DEFAULT_FORMS_API_ENDPOINT = "/api/notPopup";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const SOURCE_FORM = "quadcode_aw_asia_2026_meeting_request";
const SOURCE_SITE = "Quadcode Brokerage Solutions";

function readString(body, key, maxLength = 1200) {
  const value = body?.[key];
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readBoolean(body, key) {
  return body?.[key] === true || body?.[key] === "true" || body?.[key] === "on";
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhone(phone, country) {
  try {
    const phoneNumber = isSupportedCountry(country) ? parsePhoneNumber(phone, country) : parsePhoneNumber(phone);

    if (phoneNumber?.number && phoneNumber.isPossible()) {
      return phoneNumber.number;
    }
  } catch {
    return "";
  }

  return "";
}

function appendIfPresent(payload, key, value) {
  if (value) {
    payload.set(key, value);
  }
}

function getLandingReference(sourceUrl, pagePath) {
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      return `${url.host}${url.pathname}`;
    } catch {
      // Fall through to page path.
    }
  }

  return pagePath || "Affiliate World Asia 2026 landing";
}

function parseCrmResponse(responseText) {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function isCrmRejection(result) {
  return typeof result === "object" && result !== null && "success" in result && result.success === false;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed." });
  }

  const body = request.body;

  if (!body || typeof body !== "object") {
    return response.status(400).json({ message: "Invalid payload." });
  }

  const firstName = readString(body, "first_name", 120);
  const email = readString(body, "email", 180);
  const phoneInput = readString(body, "phone", 80);
  const phoneCountry = readString(body, "phone_country", 10);
  const phone = normalizePhone(phoneInput, phoneCountry);
  const termsAgree = readBoolean(body, "terms_agree");

  if (!firstName || !email || !phoneInput || !termsAgree) {
    return response.status(400).json({ message: "Name, work email, phone and consent are required." });
  }

  if (!isEmail(email)) {
    return response.status(400).json({ message: "Enter a valid work email address." });
  }

  if (!phone) {
    return response.status(400).json({ message: "Enter a valid phone number with country code." });
  }

  const companyName = readString(body, "company_name", 180);
  const telegram = readString(body, "tg", 120);
  const website = readString(body, "website", 220);
  const preferredSlot = readString(body, "preferred_slot", 180);
  const sourceUrl = readString(body, "source_url", 500);
  const pagePath = readString(body, "page_path", 220);
  const language = readString(body, "lang_by_browser", 20) || "en";
  const roistatId = readString(body, "roistat_id", 120);
  const comment = readString(body, "comment", 1200);
  const landingReference = getLandingReference(sourceUrl, pagePath);
  const requestType = "Affiliate World Asia 2026 booth meeting";

  const contextLines = [
    `${SOURCE_SITE} lead`,
    `Request type: ${requestType}`,
    "Event: Affiliate World Asia 2026, Bangkok, Thailand, 9-10 December 2026",
    "Booth: A96",
    companyName ? `Company: ${companyName}` : "",
    website ? `Website: ${website}` : "",
    telegram ? `Telegram: ${telegram}` : "",
    preferredSlot ? `Preferred day/time: ${preferredSlot}` : "",
    comment ? `Notes: ${comment}` : "",
    phoneCountry ? `Phone country: ${phoneCountry}` : "",
    pagePath ? `Page: ${pagePath}` : "",
    sourceUrl ? `Source URL: ${sourceUrl}` : "",
    ...UTM_FIELDS.map((field) => {
      const value = readString(body, field, 180);
      return value ? `${field}: ${value}` : "";
    })
  ].filter(Boolean);

  const payload = new FormData();
  payload.set("first_name", firstName);
  payload.set("email", email);
  payload.set("phone", phone);
  payload.set("terms_agree", "on");
  payload.set("landing_url", landingReference);
  payload.set("referrer", landingReference);
  payload.set("lang_by_browser", language);
  payload.set("source_form", SOURCE_FORM);
  payload.set("source_site", SOURCE_SITE);
  appendIfPresent(payload, "tg", telegram);
  appendIfPresent(payload, "comment", contextLines.join("\n"));
  appendIfPresent(payload, "roistat_id", roistatId);

  for (const field of UTM_FIELDS) {
    appendIfPresent(payload, field, readString(body, field, 180));
  }

  const formsApiUrl = process.env.FORMS_API_URL ?? DEFAULT_FORMS_API_URL;
  const formsApiEndpoint = process.env.FORMS_API_ENDPOINT ?? DEFAULT_FORMS_API_ENDPOINT;
  const endpoint = new URL(formsApiEndpoint, formsApiUrl);

  if (process.env.FORMS_API_DRY_RUN === "true") {
    return response.status(200).json({ success: true, message: "Dry run request accepted." });
  }

  try {
    const crmResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: payload,
      cache: "no-store"
    });

    const responseText = await crmResponse.text();
    const crmResult = parseCrmResponse(responseText);

    if (!crmResponse.ok || isCrmRejection(crmResult)) {
      console.error("CRM rejected lead request", {
        status: crmResponse.status,
        body: responseText.slice(0, 500)
      });

      return response
        .status(crmResponse.status === 422 ? 422 : 502)
        .json({ message: "The CRM rejected the request. Check the fields and try again." });
    }

    return response.status(200).json({ success: true, message: "Request sent." });
  } catch {
    return response.status(502).json({ message: "We could not send the request right now." });
  }
}
