(() => {
  "use strict";

  const TRACKER_ENDPOINT =
    "https://141-136-42-212.sslip.io/dialogs_monitor/api/webinar-events";
  const WEBINAR_KEY = "vibecode_brokerage_daily";
  const REGISTRATION_KEY = "quadcodeVibecodeBrokerageWebinarRegistration";
  const PENDING_REGISTRATION_KEY =
    "quadcodeVibecodeBrokerageWebinarPendingRegistration";
  const PENDING_ATTENDANCE_KEY = "quadcodeVibecodeBrokerageWebinarPendingAttendance";
  const REQUEST_TIMEOUT_MS = 6000;

  const readJson = (key, fallback = null) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  };

  const remove = (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Tracking remains best-effort when browser storage is unavailable.
    }
  };

  const createRegistrationId = () => {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
      const random = Math.floor(Math.random() * 16);
      const value = token === "x" ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
  };

  const post = async (path, payload) => {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(`${TRACKER_ENDPOINT}${path}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        keepalive: true,
        signal: controller.signal,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error || `Tracking request failed: ${response.status}`);
      }
      return body;
    } finally {
      globalThis.clearTimeout(timeout);
    }
  };

  const normalizeRegistration = (registration) => ({
    ...registration,
    registrationId:
      registration.registrationId || createRegistrationId(),
    webinarKey: WEBINAR_KEY,
  });

  const saveRegistration = (registration) => {
    const normalized = normalizeRegistration(registration);
    writeJson(REGISTRATION_KEY, normalized);
    return normalized;
  };

  const readRegistration = () => {
    const registration = readJson(REGISTRATION_KEY, {}) || {};
    const queryId = new URLSearchParams(location.search).get("rid")?.trim();
    if (queryId) registration.registrationId = queryId;
    return registration;
  };

  const register = async (registration) => {
    const normalized = saveRegistration(registration);
    writeJson(PENDING_REGISTRATION_KEY, normalized);
    const result = await post("/register", normalized);
    const saved = {
      ...normalized,
      registrationId: result.registrationId || normalized.registrationId,
      trackerRegisteredAt: new Date().toISOString(),
    };
    writeJson(REGISTRATION_KEY, saved);
    remove(PENDING_REGISTRATION_KEY);
    return saved;
  };

  const attendance = async (event) => {
    const registration = readRegistration();
    if (!registration.registrationId) return null;

    const payload = {
      registrationId: registration.registrationId,
      webinarKey: WEBINAR_KEY,
      registeredSessionStart: registration.sessionStart || "",
      event: event.event || "heartbeat",
      watchedSeconds: Math.max(0, Math.floor(Number(event.watchedSeconds) || 0)),
      actualSessionStart: event.actualSessionStart || "",
      occurredAt: event.occurredAt || new Date().toISOString(),
    };
    writeJson(PENDING_ATTENDANCE_KEY, payload);
    const result = await post("/attendance", payload);
    remove(PENDING_ATTENDANCE_KEY);
    return result;
  };

  const flush = async () => {
    const pendingRegistration = readJson(PENDING_REGISTRATION_KEY);
    if (pendingRegistration) {
      try {
        await register(pendingRegistration);
      } catch {
        // The next page load or online event retries the same idempotent event.
      }
    }

    const pendingAttendance = readJson(PENDING_ATTENDANCE_KEY);
    if (pendingAttendance) {
      try {
        await attendance(pendingAttendance);
      } catch {
        // Keep the latest cumulative heartbeat for the next retry.
      }
    }
  };

  globalThis.QuadcodeWebinarTracking = {
    attendance,
    constants: {
      endpoint: TRACKER_ENDPOINT,
      registrationKey: REGISTRATION_KEY,
      webinarKey: WEBINAR_KEY,
    },
    createRegistrationId,
    flush,
    readRegistration,
    register,
    saveRegistration,
  };

  globalThis.addEventListener("online", () => void flush());
  if (document.visibilityState === "visible") void flush();
})();
