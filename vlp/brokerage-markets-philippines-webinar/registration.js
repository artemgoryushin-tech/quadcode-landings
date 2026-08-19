(() => {
  "use strict";

  const form = document.querySelector("#registration-form");
  if (!form) return;

  const status = document.querySelector("#form-status");
  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel = submitButton.querySelector("span");
  const requiredFields = [...form.querySelectorAll("[required]")];
  const card = form.closest(".registration-card");
  const cardHead = card?.querySelector(".registration-card__head");
  const returnLink = card?.querySelector(".return-link");
  const successPanel = card?.querySelector("#registration-success");
  const successName = successPanel?.querySelector("[data-success-name]");
  const successEmail = successPanel?.querySelector("[data-success-email]");
  const successTime = successPanel?.querySelector("[data-success-time]");

  const messages = {
    firstName: "Ilagay ang pangalan mo.",
    email: "Maglagay ng valid na work email.",
    phoneLocal: "Maglagay ng valid na mobile number.",
    about: "Magbigay ng kaunting detalye tungkol sa iyo (hindi bababa sa 20 characters).",
    whyJoin: "Sabihin kung bakit gusto mong sumali (hindi bababa sa 20 characters).",
    consent: "Kailangan ang consent mo para magpatuloy.",
  };

  const errorNode = (field) =>
    form.querySelector(`[data-error-for="${field.id}"]`);

  const setError = (field, message = "") => {
    const target = errorNode(field);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (target) target.textContent = message;
  };

  const validateField = (field) => {
    const isCheckbox = field.type === "checkbox";
    const value = isCheckbox ? "" : field.value.trim();
    const empty = isCheckbox ? !field.checked : !value;
    let message = "";

    if (empty) {
      message = messages[field.name] || "Kumpletuhin ang field na ito.";
    } else if (field.type === "email" && !field.validity.valid) {
      message = messages.email;
    } else if (field.type === "tel") {
      const digitCount = value.replace(/\D/g, "").length;
      const hasValidCharacters = /^\+?[\d\s().-]+$/.test(value);
      if (!hasValidCharacters || digitCount < 7 || digitCount > 15) {
        message = messages.phoneLocal;
      }
    } else if (
      (field.name === "about" || field.name === "whyJoin") &&
      value.length < 20
    ) {
      message = messages[field.name];
    }

    setError(field, message);
    return !message;
  };

  const showSuccess = (registration) => {
    if (
      !card ||
      !cardHead ||
      !returnLink ||
      !successPanel ||
      !successName ||
      !successEmail ||
      !successTime
    ) {
      return;
    }

    successName.textContent = registration.firstName;
    successEmail.textContent = registration.email;
    successTime.textContent =
      window.QuadcodeWebinarSchedule?.formatSessionLabel?.(
        registration.sessionStart,
      ) ||
      "5:00 PM PHT";

    cardHead.hidden = true;
    form.hidden = true;
    returnLink.hidden = true;
    successPanel.hidden = false;
    card.classList.add("is-complete");
    card.setAttribute("aria-labelledby", "registration-success-title");

    successPanel.focus({ preventScroll: true });
    successPanel.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
  };

  requiredFields.forEach((field) => {
    const eventName =
      field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "blur";
    field.addEventListener(eventName, () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";

    const validity = requiredFields.map((field) => ({
      field,
      valid: validateField(field),
    }));
    const firstInvalid = validity.find((item) => !item.valid);

    if (firstInvalid) {
      firstInvalid.field.focus();
      status.textContent = "Pakitingnan ang mga naka-highlight na field.";
      status.style.color = "#c71929";
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const about = data.about?.trim() || "";
    const whyJoin = data.whyJoin?.trim() || "";
    const sessionStart =
      window.QuadcodeWebinarSchedule?.getNextSession?.()?.toISOString?.() || "";
    const trackingFields = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];
    const pageParams = new URLSearchParams(window.location.search);
    const storedTrackingValue = (field) => {
      try {
        return localStorage.getItem(`param__${field}`) || "";
      } catch {
        return "";
      }
    };
    const tracking = Object.fromEntries(
      trackingFields
        .map((field) => [
          field,
          pageParams.get(field) || storedTrackingValue(field),
        ])
        .filter(([, value]) => value),
    );
    const registration = {
      registrationId:
        window.QuadcodeWebinarTracking?.createRegistrationId?.() ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      firstName: data.firstName?.trim() || "",
      lastName: "",
      email: data.email?.trim() || "",
      phone: data.phone?.trim() || data.phoneLocal?.trim() || "",
      phoneCountry: data.phoneCountry?.trim() || "PH",
      telegram: data.telegram?.trim() || "",
      about,
      whyJoin,
      motivation: `About:\n${about}\n\nWhy join:\n${whyJoin}`,
      company: data.company?.trim() || "",
      country: "Philippines",
      registeredAt: new Date().toISOString(),
      sessionStart,
      sourceForm: "quadcode_philippines_markets_webinar",
      tracking,
    };

    submitButton.disabled = true;
    submitLabel.textContent = "Nagre-register…";
    status.style.color = "";
    status.textContent = "Ipinapadala ang registration mo…";

    try {
      const isLocalPreview =
        window.location.protocol === "file:" ||
        ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
      let completedRegistration = registration;

      if (window.QuadcodeWebinarTracking) {
        window.QuadcodeWebinarTracking.saveRegistration(registration);
        if (!isLocalPreview) {
          try {
            completedRegistration =
              await window.QuadcodeWebinarTracking.register(registration);
          } catch (trackingError) {
            console.warn("Webinar tracking queued", trackingError);
          }
        }
      }

      if (!isLocalPreview) {
        if (!window.QuadcodeWebinarCRM?.submit) {
          throw new Error("Registration service is unavailable.");
        }
        await window.QuadcodeWebinarCRM.submit(completedRegistration);
      }

      if (!window.QuadcodeWebinarTracking) {
        try {
          localStorage.setItem(
            "quadcodePhilippinesMarketsWebinarRegistration",
            JSON.stringify(completedRegistration),
          );
        } catch {
          // Access still works when storage is unavailable.
        }
      }

      window.dispatchEvent(
        new CustomEvent("quadcode:webinar-register", {
          detail: completedRegistration,
        }),
      );

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "lead_submit",
        form_id: "quadcode_philippines_markets_webinar",
        registered_webinar: true,
        webinar_session_start: sessionStart,
        page_location: window.location.href,
      });

      showSuccess(completedRegistration);
    } catch (error) {
      console.error("Webinar registration error", error);
      submitButton.disabled = false;
      submitLabel.textContent = "Mag-register nang libre";
      status.style.color = "#c71929";
      status.textContent =
        error?.name === "AbortError"
          ? "Masyadong matagal ang registration. Pakisubukan ulit."
          : "Hindi nakumpleto ang registration. Pakisubukan ulit.";
    }
  });
})();
