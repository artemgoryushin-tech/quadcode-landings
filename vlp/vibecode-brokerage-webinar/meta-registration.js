(function trackVibecodeBrokerageWebinarRegistration() {
  "use strict";

  var stateKey = "__quadcodeVibecodeBrokerageCompleteRegistration";

  // A document-level guard prevents duplicate listeners if this file is evaluated again.
  if (window[stateKey]) {
    return;
  }

  var state = {
    pending: Object.create(null),
    sent: Object.create(null),
  };

  window[stateKey] = state;

  function registrationKey(registration) {
    return (
      registration.registrationId ||
      [registration.email || "anonymous", registration.sessionStart || "next-session"].join("|")
    );
  }

  function eventDate(registration) {
    var sessionStart = String(registration.sessionStart || "");
    var isoDate = sessionStart.match(/^\d{4}-\d{2}-\d{2}/);
    return isoDate ? isoDate[0] : new Date().toISOString().slice(0, 10);
  }

  function sendWhenPixelIsReady(registration, key, attempt) {
    if (state.sent[key]) {
      return;
    }

    if (typeof window.fbq === "function") {
      window.fbq("track", "CompleteRegistration", {
        content_name: "Can You Vibe Code a Brokerage?",
        content_category: "Webinar",
        event_date: eventDate(registration),
      });
      state.sent[key] = true;
      delete state.pending[key];
      return;
    }

    if (attempt >= 100) {
      delete state.pending[key];
      return;
    }

    state.pending[key] = window.setTimeout(function retryMetaRegistration() {
      sendWhenPixelIsReady(registration, key, attempt + 1);
    }, 100);
  }

  window.addEventListener("quadcode:webinar-register", function onRegistration(event) {
    var registration = event.detail || {};
    var key = registrationKey(registration);

    if (state.sent[key] || state.pending[key]) {
      return;
    }

    sendWhenPixelIsReady(registration, key, 0);
  });
})();
