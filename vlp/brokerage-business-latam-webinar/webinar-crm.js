(() => {
  "use strict";

  const DEFAULT_ENDPOINT = "https://group.quadcode.com/api/notPopup";
  const DEFAULT_STATUS_ID = "UC_SDFUX2";
  const SOURCE_FORM = "quadcode_latam_webinar";
  const SOURCE_SITE = "Quadcode Brokerage Solutions";
  const WEBINAR_TITLE = "Negocio de Brokerage en LATAM: ¿Cómo Empezar?";
  const SESSION_TIME =
    "16:00 UTC (10:00 México; 11:00 Colombia y Perú; 13:00 Argentina)";
  const DEFAULT_WEBINAR_URL =
    "https://quadcode.com/vlp/brokerage-business-latam-webinar/watch/";
  const TRACKING_FIELDS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  const value = (input) => String(input || "").trim();

  const optionalSet = (formData, name, fieldValue) => {
    const normalizedValue = value(fieldValue);
    if (normalizedValue) formData.set(name, normalizedValue);
  };

  const cookieValue = (name, cookie = "") => {
    const prefix = `${name}=`;
    const item = String(cookie)
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));

    return item ? decodeURIComponent(item.slice(prefix.length)) : "";
  };

  const pageReference = (pageUrl) => {
    try {
      const url = new URL(pageUrl);
      return `${url.host}${url.pathname}`;
    } catch {
      return "quadcode.com/vlp/brokerage-business-latam-webinar/";
    }
  };

  const webinarUrlFor = (pageUrl, configuredUrl) => {
    if (value(configuredUrl)) return value(configuredUrl);

    try {
      return new URL("./watch/", pageUrl).href;
    } catch {
      return DEFAULT_WEBINAR_URL;
    }
  };

  const getTracking = (pageUrl, storage) => {
    const tracking = {};

    try {
      const url = new URL(pageUrl);
      TRACKING_FIELDS.forEach((field) => {
        const currentValue = url.searchParams.get(field);
        const storedValue = storage?.getItem?.(`param__${field}`);
        const fieldValue = currentValue || storedValue;
        if (fieldValue) tracking[field] = fieldValue;
      });
    } catch {
      // Tracking is optional and must never block registration.
    }

    return tracking;
  };

  const buildPayload = (registration, context = {}) => {
    const browserLocation =
      typeof window !== "undefined" ? window.location.href : "";
    const browserReferrer =
      typeof document !== "undefined" ? document.referrer : "";
    const browserLanguage =
      typeof navigator !== "undefined" ? navigator.language : "es-419";
    const browserCookie =
      typeof document !== "undefined" ? document.cookie : "";
    const browserStorage =
      typeof localStorage !== "undefined" ? localStorage : null;
    const runtimeConfig =
      typeof globalThis.QUADCODE_WEBINAR_CRM === "object"
        ? globalThis.QUADCODE_WEBINAR_CRM
        : {};

    const pageUrl = context.pageUrl || browserLocation;
    const pagePath = pageReference(pageUrl);
    const statusId =
      context.statusId || runtimeConfig.statusId || DEFAULT_STATUS_ID;
    const webinarUrl = webinarUrlFor(
      pageUrl,
      context.webinarUrl || runtimeConfig.webinarUrl,
    );
    const about = value(registration.about);
    const whyJoin = value(registration.whyJoin);
    const phoneCountry = value(registration.phoneCountry);
    const telegram = value(registration.telegram);
    const notes = [
      `Webinar: ${WEBINAR_TITLE}`,
      `Etapa solicitada: registered webinar (${statusId})`,
      `Hora de la sesión: ${SESSION_TIME}`,
      `Webinar URL: ${webinarUrl}`,
      about ? `Sobre la persona:\n${about}` : "",
      whyJoin ? `Motivo para participar:\n${whyJoin}` : "",
      telegram ? `Telegram: ${telegram}` : "",
      phoneCountry ? `País del teléfono: ${phoneCountry}` : "",
      pageUrl ? `URL de origen: ${pageUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    const payload = new FormData();

    payload.set("first_name", value(registration.firstName));
    payload.set("email", value(registration.email));
    payload.set("phone", value(registration.phone).replace(/[^\d+]/g, ""));
    payload.set("terms_agree", "on");
    payload.set("landing_url", pagePath);
    payload.set(
      "referrer",
      pageReference(context.referrer || browserReferrer || pageUrl),
    );
    payload.set(
      "lang_by_browser",
      context.language || browserLanguage || "es-419",
    );
    payload.set("source_form", SOURCE_FORM);
    payload.set("source_site", SOURCE_SITE);

    // The Quadcode proxy uses snake_case fields. STATUS_ID is also sent so a
    // direct Bitrix field passthrough can place the lead in the same stage.
    payload.set("status_id", statusId);
    payload.set("STATUS_ID", statusId);
    payload.set("stage_name", "registered webinar");
    payload.set("lead_source", "webinar");
    payload.set("source", "webinar");
    payload.set("session_time", SESSION_TIME);
    payload.set("webinar_url", webinarUrl);
    payload.set("access_url", webinarUrl);

    optionalSet(payload, "tg", telegram);
    optionalSet(payload, "comment", notes);
    optionalSet(payload, "phone_country", phoneCountry);
    optionalSet(payload, "current_business", about);
    optionalSet(payload, "short_bio", about);
    optionalSet(payload, "why_launch", whyJoin);
    optionalSet(payload, "event_about", about);
    optionalSet(payload, "event_why_join", whyJoin);

    const tracking =
      context.tracking || getTracking(pageUrl, context.storage || browserStorage);
    TRACKING_FIELDS.forEach((field) =>
      optionalSet(payload, field, tracking[field]),
    );

    optionalSet(
      payload,
      "roistat_id",
      context.roistatId || cookieValue("roistat_visit", browserCookie),
    );

    return payload;
  };

  const responseMessage = (responseBody) => {
    if (!responseBody || typeof responseBody !== "object") return "";
    if (responseBody.message) return value(responseBody.message);

    const [field, messages] = Object.entries(responseBody.errors || {})[0] || [];
    if (!field) return "";

    const label = field.replace(/_/g, " ");
    const message = Array.isArray(messages) ? messages[0] : messages;
    return `${label}: ${value(message)}`;
  };

  const submit = async (registration, context = {}) => {
    const runtimeConfig =
      typeof globalThis.QUADCODE_WEBINAR_CRM === "object"
        ? globalThis.QUADCODE_WEBINAR_CRM
        : {};
    const endpoint =
      context.endpoint || runtimeConfig.endpoint || DEFAULT_ENDPOINT;
    const fetchRequest = context.fetch || globalThis.fetch;
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(
      () => controller.abort(),
      context.timeoutMs || 12000,
    );

    try {
      const response = await fetchRequest(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: buildPayload(registration, context),
        signal: controller.signal,
      });
      const rawBody = await response.text();
      let responseBody = null;

      try {
        responseBody = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        responseBody = rawBody;
      }

      const rejected =
        !response.ok ||
        (responseBody &&
          typeof responseBody === "object" &&
          (responseBody.success === false || responseBody.errors));

      if (rejected) {
        throw new Error(
          responseMessage(responseBody) ||
            "No pudimos registrarte en el webinar. Inténtalo de nuevo.",
        );
      }

      return responseBody;
    } finally {
      globalThis.clearTimeout(timeout);
    }
  };

  globalThis.QuadcodeWebinarCRM = {
    buildPayload,
    submit,
    constants: {
      endpoint: DEFAULT_ENDPOINT,
      sourceForm: SOURCE_FORM,
      statusId: DEFAULT_STATUS_ID,
      sessionTime: SESSION_TIME,
      webinarUrl: DEFAULT_WEBINAR_URL,
    },
  };
})();
