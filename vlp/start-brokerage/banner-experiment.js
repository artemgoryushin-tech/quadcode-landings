(() => {
  "use strict";

  const root = document.querySelector("[data-webinar-preheader]");
  const cta = root?.querySelector("[data-banner-cta]");
  const timer = root?.querySelector("[data-banner-timer]");
  if (!root || !cta || !timer) return;

  const variants = ["graphite", "red", "ivory"];
  const experimentId = "start-brokerage-webinar-banner-color-v1";
  const assignmentKey = `qc-experiment:${experimentId}:assignment`;
  const visitorKey = "qc-experiment:visitor-id";
  const impressionKey = `qc-experiment:${experimentId}:impression`;
  const endpoint = "/vlp/start-brokerage/api/banner-experiment/";
  const query = new URLSearchParams(window.location.search);

  const storageGet = (storage, key) => {
    try {
      return storage.getItem(key) || "";
    } catch {
      return "";
    }
  };

  const storageSet = (storage, key, value) => {
    try {
      storage.setItem(key, value);
    } catch {
      // The experiment still works for the current page when storage is blocked.
    }
  };

  const createVisitorId = () => {
    const stored = storageGet(localStorage, visitorKey);
    if (stored) return stored;
    const generated = window.crypto?.randomUUID?.() ||
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    storageSet(localStorage, visitorKey, generated);
    return generated;
  };

  const fallbackVariant = (visitorId) => {
    let hash = 2166136261;
    for (let index = 0; index < visitorId.length; index += 1) {
      hash ^= visitorId.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return variants[(hash >>> 0) % variants.length];
  };

  const pushDataLayer = (event, variant, mode) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      experiment_id: experimentId,
      banner_variant: variant,
      optimization_mode: mode,
      banner_destination: cta.href,
    });
  };

  const postEvent = (action, variant, mode) => {
    const payload = JSON.stringify({
      experimentId,
      action,
      variant,
      mode,
    });

    if (navigator.sendBeacon) {
      const accepted = navigator.sendBeacon(
        endpoint,
        new Blob([payload], { type: "application/json" }),
      );
      if (accepted) return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => {});
  };

  const updateDestination = (variant) => {
    const destination = new URL(cta.getAttribute("href"), window.location.href);
    const trackingFields = ["utm_source", "utm_medium", "utm_campaign", "utm_term"];

    trackingFields.forEach((field) => {
      const value = query.get(field);
      if (value) destination.searchParams.set(field, value.slice(0, 180));
    });

    const currentContent = query.get("utm_content") || "";
    const marker = `webinar_banner_${variant}`;
    destination.searchParams.set(
      "utm_content",
      currentContent ? `${currentContent.slice(0, 140)}|${marker}` : marker,
    );
    destination.searchParams.set("banner_variant", variant);
    cta.href = destination.toString();
  };

  let activeVariant = "graphite";
  let optimizationMode = "split";

  const applyVariant = (variant, mode) => {
    activeVariant = variants.includes(variant) ? variant : "graphite";
    optimizationMode = mode || "split";
    root.dataset.bannerVariant = activeVariant;
    root.dataset.optimizationMode = optimizationMode;
    updateDestination(activeVariant);
  };

  const readAssignment = () => {
    try {
      const parsed = JSON.parse(storageGet(localStorage, assignmentKey));
      return variants.includes(parsed?.variant) ? parsed : null;
    } catch {
      return null;
    }
  };

  const saveAssignment = (variant, mode) => {
    storageSet(
      localStorage,
      assignmentKey,
      JSON.stringify({ variant, mode, assignedAt: new Date().toISOString() }),
    );
  };

  const recordImpression = () => {
    if (storageGet(sessionStorage, impressionKey)) return;
    storageSet(sessionStorage, impressionKey, activeVariant);
    pushDataLayer("start_brokerage_webinar_banner_impression", activeVariant, optimizationMode);
    postEvent("impression", activeVariant, optimizationMode);
  };

  const assignVariant = async () => {
    const forced = query.get("bannerVariant");
    if (variants.includes(forced)) {
      applyVariant(forced, "preview");
      return;
    }

    const cached = readAssignment();
    if (cached) {
      applyVariant(cached.variant, cached.mode || "sticky");
      recordImpression();
      return;
    }

    const visitorId = createVisitorId();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 900);
    let assignment = null;

    try {
      const response = await fetch(
        `${endpoint}?visitor=${encodeURIComponent(visitorId)}`,
        { credentials: "same-origin", signal: controller.signal },
      );
      if (response.ok) assignment = await response.json();
    } catch {
      // Equal deterministic split is the safe fallback when the optimizer is offline.
    } finally {
      window.clearTimeout(timeout);
    }

    const variant = variants.includes(assignment?.variant)
      ? assignment.variant
      : fallbackVariant(visitorId);
    const mode = assignment?.mode === "adaptive" ? "adaptive" : "split";
    applyVariant(variant, mode);
    saveAssignment(variant, mode);
    recordImpression();
  };

  const pad = (value) => String(value).padStart(2, "0");
  const updateCountdown = () => {
    const now = new Date();
    const nextSession = new Date(now.getTime());
    nextSession.setUTCHours(9, 0, 0, 0);
    if (now.getTime() > nextSession.getTime() + 60_000) {
      nextSession.setUTCDate(nextSession.getUTCDate() + 1);
    }

    const totalSeconds = Math.max(0, Math.floor((nextSession - now) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    root.querySelector("[data-banner-hours]").textContent = pad(hours);
    root.querySelector("[data-banner-minutes]").textContent = pad(minutes);
    root.querySelector("[data-banner-seconds]").textContent = pad(seconds);
    timer.setAttribute(
      "aria-label",
      `${hours} hours, ${minutes} minutes, and ${seconds} seconds until the next webinar`,
    );
  };

  cta.addEventListener("click", () => {
    pushDataLayer("start_brokerage_webinar_banner_click", activeVariant, optimizationMode);
    postEvent("click", activeVariant, optimizationMode);
  });

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  assignVariant();
})();
