const DEFAULT_FORMS_API_URL = "https://quadcode.foach.site";
const DEFAULT_FORMS_API_ENDPOINT = "/api/notPopup";
const SOURCE_FORM = "quadcode_colombia_ready_to_go_business";
const SOURCE_SITE = "Quadcode Brokerage Solutions";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

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

function normalizePhone(value) {
  const digits = value.replace(/\D/g, "");
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : "";
}

function appendIfPresent(payload, key, value) {
  if (value) payload.set(key, value);
}

function landingReference(sourceUrl, pagePath) {
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      return `${url.host}${url.pathname}`;
    } catch {
      // Use the page path below when the submitted URL is malformed.
    }
  }
  return pagePath || "Quadcode Colombia ready-to-go brokerage business landing";
}

function parseResponse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ success: false, message: "Method not allowed." });
  }

  const body = request.body;
  if (!body || typeof body !== "object") {
    return response.status(400).json({ success: false, message: "Invalid payload." });
  }

  const firstName = readString(body, "first_name", 120);
  const email = readString(body, "email", 180);
  const phoneInput = readString(body, "phone", 80);
  const phoneCountry = readString(body, "phone_country", 10).toUpperCase();
  const currentModel = readString(body, "current_model", 120);
  const launchHorizon = readString(body, "launch_horizon", 120);
  const regulatoryStatus = readString(body, "regulatory_status", 180);
  const termsAgree = readBoolean(body, "terms_agree");
  const phone = normalizePhone(phoneInput);

  if (!firstName || !email || !phoneInput || !currentModel || !launchHorizon || !regulatoryStatus || !termsAgree) {
    return response.status(400).json({ success: false, message: "Complete all required demo-request fields." });
  }
  if (!isEmail(email)) {
    return response.status(400).json({ success: false, message: "Enter a valid work email address." });
  }
  if (!phone) {
    return response.status(400).json({ success: false, message: "Enter a valid WhatsApp number with country code." });
  }

  const language = readString(body, "lang_by_browser", 20) || "es";
  const comment = readString(body, "comment", 1200);
  const sourceUrl = readString(body, "source_url", 500);
  const pagePath = readString(body, "page_path", 220);
  const roistatId = readString(body, "roistat_id", 120);
  const reference = landingReference(sourceUrl, pagePath);
  const context = [
    `${SOURCE_SITE} lead`,
    "Request type: Colombia Ready-to-Go Brokerage Business Demo",
    `Entrepreneur starting point: ${currentModel}`,
    `Launch horizon: ${launchHorizon}`,
    `Regulatory setup: ${regulatoryStatus}`,
    comment ? `Additional context: ${comment}` : "",
    `Phone country: ${phoneCountry}`,
    `Landing language: ${language}`,
    pagePath ? `Page: ${pagePath}` : "",
    sourceUrl ? `Source URL: ${sourceUrl}` : "",
    ...UTM_FIELDS.map((field) => {
      const value = readString(body, field, 180);
      return value ? `${field}: ${value}` : "";
    })
  ].filter(Boolean);

  const crmPayload = new FormData();
  crmPayload.set("first_name", firstName);
  crmPayload.set("email", email);
  crmPayload.set("phone", phone);
  crmPayload.set("terms_agree", "on");
  crmPayload.set("landing_url", reference);
  crmPayload.set("referrer", reference);
  crmPayload.set("lang_by_browser", language);
  crmPayload.set("source_form", SOURCE_FORM);
  crmPayload.set("source_site", SOURCE_SITE);
  crmPayload.set("comment", context.join("\n"));
  appendIfPresent(crmPayload, "roistat_id", roistatId);
  for (const field of UTM_FIELDS) {
    appendIfPresent(crmPayload, field, readString(body, field, 180));
  }

  const endpoint = new URL(
    process.env.FORMS_API_ENDPOINT || DEFAULT_FORMS_API_ENDPOINT,
    process.env.FORMS_API_URL || DEFAULT_FORMS_API_URL
  );

  if (process.env.FORMS_API_DRY_RUN === "true") {
    return response.status(200).json({ success: true, message: "Dry-run demo request accepted." });
  }

  try {
    const crmResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: crmPayload,
      cache: "no-store"
    });
    const responseText = await crmResponse.text();
    const result = parseResponse(responseText);
    if (!crmResponse.ok || (result && typeof result === "object" && result.success === false)) {
      console.error("CRM rejected Colombia demo request", {
        status: crmResponse.status,
        body: responseText.slice(0, 500)
      });
      return response.status(crmResponse.status === 422 ? 422 : 502).json({
        success: false,
        message: "The CRM rejected the request. Check the fields and try again."
      });
    }
    return response.status(200).json({ success: true, message: "Demo request sent." });
  } catch {
    return response.status(502).json({ success: false, message: "We could not send the request right now." });
  }
};
