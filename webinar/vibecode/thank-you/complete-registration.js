(function trackVibecodeWebinarRegistration() {
  "use strict";

  var stateKey = "__quadcodeVibecodeCompleteRegistration";

  // A document-level guard prevents duplicate events if this file is evaluated again.
  if (window[stateKey]) {
    return;
  }

  var state = {
    attempts: 0,
    sent: false,
    timer: null,
  };

  window[stateKey] = state;

  var eventParameters = {
    content_name: "Can I Vibecode a Brokerage Platform?",
    content_category: "Webinar",
    event_date: "2026-08-18",
  };

  function sendEvent() {
    if (state.sent || typeof window.fbq !== "function") {
      return state.sent;
    }

    // fbq is initialized by the existing production GTM container.
    // This page intentionally does not create a Pixel or include a Pixel ID.
    state.sent = true;
    window.fbq("track", "CompleteRegistration", eventParameters);
    return true;
  }

  function waitForPixel() {
    state.attempts += 1;

    if (sendEvent() || state.attempts >= 100) {
      state.timer = null;
      return;
    }

    state.timer = window.setTimeout(waitForPixel, 100);
  }

  if (!sendEvent()) {
    state.timer = window.setTimeout(waitForPixel, 100);
  }
})();
