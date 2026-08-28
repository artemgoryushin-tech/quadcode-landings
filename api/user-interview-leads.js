const MAX_LENGTHS = {
  name: 160,
  country: 100,
  email: 180,
  phone: 80,
  telegram: 120,
  current_business: 500,
  brokerage_motivation: 700,
  source_url: 600,
  page_path: 220,
  referrer: 600,
  language: 24,
  timezone: 80,
  utm_source: 180,
  utm_medium: 180,
  utm_campaign: 180,
  utm_term: 180,
  utm_content: 180,
};

function readString(body, key) {
  const value = body?.[key];
  const maxLength = MAX_LENGTHS[key] || 1200;
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readBoolean(body, key) {
  return body?.[key] === true || body?.[key] === "true" || body?.[key] === "on";
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function isTelegram(value) {
  return value.replace(/^@/, "").length >= 2;
}

function isSafeSourceUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

async function verifyRecaptcha(token, remoteIp) {
  const secret = process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET;
  if (!secret) return Boolean(token);

  const params = new URLSearchParams({ secret, response: token });
  if (remoteIp) params.set("remoteip", remoteIp);
  const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });
  const result = await verification.json();
  return Boolean(result?.success);
}

function webhookUrl() {
  const endpoint = process.env.USER_INTERVIEW_SHEETS_WEBHOOK_URL;
  if (!endpoint) return "";
  const url = new URL(endpoint);
  const secret = process.env.USER_INTERVIEW_SHEETS_WEBHOOK_SECRET;
  if (secret) url.searchParams.set("secret", secret);
  return url.toString();
}

function parseWebhookResponse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ success: false, message: "Method not allowed." });
  }

  const body = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return response.status(400).json({ success: false, message: "Invalid form data." });
  }

  if (readString(body, "company_website")) {
    return response.status(200).json({ success: true, message: "Application received." });
  }

  const name = readString(body, "name");
  const country = readString(body, "country");
  const email = readString(body, "email").toLowerCase();
  const phone = readString(body, "phone");
  const telegram = readString(body, "telegram");
  const currentBusiness = readString(body, "current_business");
  const brokerageMotivation = readString(body, "brokerage_motivation");
  const agreement = readBoolean(body, "agreement");
  const token = typeof body.token === "string" ? body.token.trim().slice(0, 4000) : "";

  if (!name || !country || !email || !phone || !currentBusiness || !brokerageMotivation || !agreement || !token) {
    return response.status(400).json({ success: false, message: "Please complete all required fields." });
  }
  if (!isEmail(email)) {
    return response.status(400).json({ success: false, message: "Please enter a valid email address." });
  }
  if (!isPhone(phone)) {
    return response.status(400).json({ success: false, message: "Please enter a valid phone number with country code." });
  }
  if (telegram && !isTelegram(telegram)) {
    return response.status(400).json({ success: false, message: "Please enter your Telegram username." });
  }
  if (currentBusiness.length < 3 || brokerageMotivation.length < 5) {
    return response.status(400).json({ success: false, message: "Please answer both business questions." });
  }

  try {
    const forwardedFor = request.headers["x-forwarded-for"];
    const remoteIp = typeof forwardedFor === "string" ? forwardedFor.split(",")[0].trim() : "";
    const captchaValid = await verifyRecaptcha(token, remoteIp);
    if (!captchaValid) {
      return response.status(400).json({ success: false, message: "Please complete the security check again." });
    }
  } catch (error) {
    console.error("User interview reCAPTCHA verification failed", error);
    return response.status(502).json({ success: false, message: "The security check is temporarily unavailable." });
  }

  const submittedAt = new Date().toISOString();
  const payload = {
    application_id: globalThis.crypto?.randomUUID?.() || `ui_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    status: "New",
    submitted_at: submittedAt,
    full_name: name,
    email,
    phone,
    telegram,
    country,
    current_business: currentBusiness,
    brokerage_motivation: brokerageMotivation,
    language: readString(body, "language") || "en",
    timezone: readString(body, "timezone"),
    source_url: isSafeSourceUrl(readString(body, "source_url")),
    page_path: readString(body, "page_path"),
    referrer: isSafeSourceUrl(readString(body, "referrer")),
    utm_source: readString(body, "utm_source"),
    utm_medium: readString(body, "utm_medium"),
    utm_campaign: readString(body, "utm_campaign"),
    utm_term: readString(body, "utm_term"),
    utm_content: readString(body, "utm_content"),
  };

  if (process.env.FORMS_API_DRY_RUN === "true" || process.env.USER_INTERVIEW_DRY_RUN === "true") {
    return response.status(200).json({ success: true, message: "Application received.", applicationId: payload.application_id });
  }

  const endpoint = webhookUrl();
  if (!endpoint) {
    console.error("USER_INTERVIEW_SHEETS_WEBHOOK_URL is not configured");
    return response.status(503).json({ success: false, message: "Applications are temporarily unavailable. Please try again later." });
  }

  try {
    const sheetResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
    });
    const responseText = await sheetResponse.text();
    const result = parseWebhookResponse(responseText);
    if (!sheetResponse.ok || result?.ok !== true) {
      console.error("Google Sheets webhook rejected user interview lead", {
        status: sheetResponse.status,
        body: responseText.slice(0, 500),
      });
      return response.status(502).json({ success: false, message: "We could not save your application. Please try again." });
    }

    return response.status(200).json({ success: true, message: "Application received.", applicationId: payload.application_id });
  } catch (error) {
    console.error("Google Sheets webhook failed", error);
    return response.status(502).json({ success: false, message: "We could not save your application. Please try again." });
  }
}
