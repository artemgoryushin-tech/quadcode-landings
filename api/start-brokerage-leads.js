const DEFAULT_FORMS_API_URL = "https://quadcode.foach.site";
const DEFAULT_FORMS_API_ENDPOINT = "/api/notPopup";
const SOURCE_FORM = "quadcode_start_brokerage";
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return "";
  return `+${digits}`;
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
      // Use the submitted page path when the source URL is malformed.
    }
  }
  return pagePath || "Quadcode start brokerage landing";
}

function parseResponse(text) {
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
    return response.status(405).json({ success: false, message: "Metode tidak diizinkan." });
  }

  const body = request.body;
  if (!body || typeof body !== "object") {
    return response.status(400).json({ success: false, message: "Data formulir tidak valid." });
  }

  const fullName = readString(body, "name", 160);
  const email = readString(body, "email", 180);
  const phone = normalizePhone(readString(body, "phone", 80));
  const phoneCountry = readString(body, "phone_country", 8);
  const initialInvestment = readString(body, "initialInvestment", 160);
  const text = readString(body, "text", 1500);
  const agreement = readBoolean(body, "agreement");
  const token = readString(body, "token", 4000);

  if (!fullName || !email || !phone || !text || !agreement || !token) {
    return response.status(400).json({ success: false, message: "Lengkapi semua kolom wajib." });
  }
  if (!isEmail(email)) {
    return response.status(400).json({ success: false, message: "Masukkan alamat email yang valid." });
  }

  const language = readString(body, "lang_by_browser", 20) || "en";
  const sourceUrl = readString(body, "source_url", 500);
  const pagePath = readString(body, "page_path", 220);
  const roistatId = readString(body, "roistat_id", 120);
  const reference = landingReference(sourceUrl, pagePath);

  const context = [
    `${SOURCE_SITE} lead`,
    "Request type: Start Brokerage Demo",
    initialInvestment ? `Initial investment: ${initialInvestment}` : "",
    phoneCountry ? `Phone country: ${phoneCountry}` : "",
    `Launch goal and current business: ${text}`,
    `Landing language: ${language}`,
    pagePath ? `Page: ${pagePath}` : "",
    sourceUrl ? `Source URL: ${sourceUrl}` : "",
    ...UTM_FIELDS.map((field) => {
      const value = readString(body, field, 180);
      return value ? `${field}: ${value}` : "";
    }),
  ].filter(Boolean);

  const crmPayload = new FormData();
  crmPayload.set("name", fullName);
  crmPayload.set("first_name", fullName);
  crmPayload.set("email", email);
  crmPayload.set("phone", phone);
  crmPayload.set("text", text);
  crmPayload.set("message", text);
  crmPayload.set("agreement", "on");
  crmPayload.set("terms_agree", "on");
  crmPayload.set("token", token);
  crmPayload.set("landing_url", reference);
  crmPayload.set("referrer", reference);
  crmPayload.set("lang_by_browser", language);
  crmPayload.set("source_form", SOURCE_FORM);
  crmPayload.set("source_site", SOURCE_SITE);
  crmPayload.set("comment", context.join("\n"));
  appendIfPresent(crmPayload, "initialInvestment", initialInvestment);
  appendIfPresent(crmPayload, "phone_country", phoneCountry);
  appendIfPresent(crmPayload, "roistat_id", roistatId);
  for (const field of UTM_FIELDS) {
    appendIfPresent(crmPayload, field, readString(body, field, 180));
  }

  const endpoint = new URL(
    process.env.FORMS_API_ENDPOINT ?? DEFAULT_FORMS_API_ENDPOINT,
    process.env.FORMS_API_URL ?? DEFAULT_FORMS_API_URL,
  );

  if (process.env.FORMS_API_DRY_RUN === "true") {
    return response.status(200).json({ success: true, message: "Pengujian formulir berhasil." });
  }

  try {
    const crmResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: crmPayload,
      cache: "no-store",
    });
    const responseText = await crmResponse.text();
    const result = parseResponse(responseText);

    if (!crmResponse.ok || (result && typeof result === "object" && result.success === false)) {
      console.error("CRM rejected start-brokerage request", {
        status: crmResponse.status,
        body: responseText.slice(0, 500),
      });
      return response
        .status(crmResponse.status === 422 ? 422 : 502)
        .json({ success: false, message: "Permintaan tidak diterima. Periksa kembali kolom formulir dan coba lagi." });
    }

    return response.status(200).json({ success: true, message: "Permintaan demo berhasil dikirim." });
  } catch {
    return response.status(502).json({ success: false, message: "Permintaan belum dapat dikirim saat ini." });
  }
};
