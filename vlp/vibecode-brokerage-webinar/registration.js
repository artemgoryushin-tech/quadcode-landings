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
  const registrationOpenButtons = [
    ...document.querySelectorAll("[data-registration-open]"),
  ];
  const registrationCloseButton = card?.querySelector(
    "[data-registration-close]",
  );
  const registrationBackdrop = document.querySelector(
    "[data-registration-backdrop]",
  );
  const mobileRegistrationMedia = window.matchMedia("(max-width: 639px)");
  const cardAnchor = document.createComment("registration-card-anchor");
  card?.parentNode?.insertBefore(cardAnchor, card);
  let previouslyFocused = null;
  let backdropTimer = 0;

  const focusableSelector = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  const setRegistrationExpanded = (expanded) => {
    registrationOpenButtons.forEach((button) => {
      button.setAttribute("aria-expanded", String(expanded));
    });
  };

  const resetRegistrationDialog = ({ restoreFocus = false } = {}) => {
    if (!card || !registrationBackdrop) return;

    window.clearTimeout(backdropTimer);
    card.classList.remove("is-open");
    registrationBackdrop.classList.remove("is-visible");
    document.body.classList.remove("registration-modal-open");
    setRegistrationExpanded(false);

    if (mobileRegistrationMedia.matches) {
      card.setAttribute("aria-hidden", "true");
      backdropTimer = window.setTimeout(() => {
        registrationBackdrop.hidden = true;
      }, 240);
    } else {
      registrationBackdrop.hidden = true;
      card.removeAttribute("role");
      card.removeAttribute("aria-modal");
      card.removeAttribute("aria-hidden");
    }

    if (restoreFocus && previouslyFocused instanceof HTMLElement) {
      previouslyFocused.focus({ preventScroll: true });
    }
    previouslyFocused = null;
  };

  const openRegistrationDialog = (trigger) => {
    if (!card || !registrationBackdrop) return;

    if (!mobileRegistrationMedia.matches) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => form.querySelector("input")?.focus(), 260);
      return;
    }

    window.clearTimeout(backdropTimer);
    previouslyFocused = trigger instanceof HTMLElement ? trigger : document.activeElement;
    registrationBackdrop.hidden = false;
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-hidden", "false");
    document.body.classList.add("registration-modal-open");
    setRegistrationExpanded(true);

    window.requestAnimationFrame(() => {
      registrationBackdrop.classList.add("is-visible");
      card.classList.add("is-open");
      window.setTimeout(() => {
        registrationCloseButton?.focus({ preventScroll: true });
      }, 80);
    });
  };

  registrationOpenButtons.forEach((button) => {
    button.addEventListener("click", () => openRegistrationDialog(button));
  });

  registrationCloseButton?.addEventListener("click", () => {
    resetRegistrationDialog({ restoreFocus: true });
  });

  registrationBackdrop?.addEventListener("click", () => {
    resetRegistrationDialog({ restoreFocus: true });
  });

  document.addEventListener("keydown", (event) => {
    if (!mobileRegistrationMedia.matches || !card?.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      resetRegistrationDialog({ restoreFocus: true });
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [...card.querySelectorAll(focusableSelector)].filter(
      (element) => !element.hidden && element.getClientRects().length > 0,
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const syncRegistrationMode = () => {
    resetRegistrationDialog();
    if (mobileRegistrationMedia.matches) {
      if (card && card.parentNode !== document.body) document.body.append(card);
      card?.setAttribute("aria-hidden", "true");
    } else if (card && cardAnchor.parentNode) {
      cardAnchor.parentNode.insertBefore(card, cardAnchor.nextSibling);
    }
  };

  mobileRegistrationMedia.addEventListener?.("change", syncRegistrationMode);
  syncRegistrationMode();

  const messages = {
    firstName: "Enter your first name.",
    email: "Enter a valid work email.",
    phoneLocal: "Enter a valid mobile number.",
    about: "Tell us a little about yourself (at least 20 characters).",
    whyJoin: "Tell us why you would like to join (at least 20 characters).",
    consent: "Consent is required to continue.",
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
      message = messages[field.name] || "Complete this field.";
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
      "3:00 PM CEST";

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
      status.textContent = "Please check the highlighted fields.";
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
      phoneCountry: data.phoneCountry?.trim() || "GB",
      telegram: data.telegram?.trim() || "",
      about,
      whyJoin,
      motivation: `About:\n${about}\n\nWhy join:\n${whyJoin}`,
      company: data.company?.trim() || "",
      country: data.phoneCountry?.trim() || "",
      registeredAt: new Date().toISOString(),
      sessionStart,
      sourceForm: "quadcode_vibecode_brokerage_webinar",
      tracking,
    };

    submitButton.disabled = true;
    submitLabel.textContent = "Registering…";
    status.style.color = "";
    status.textContent = "Sending your registration…";

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
            "quadcodeVibecodeBrokerageWebinarRegistration",
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
        form_id: "quadcode_vibecode_brokerage_webinar",
        registered_webinar: true,
        webinar_session_start: sessionStart,
        page_location: window.location.href,
      });

      showSuccess(completedRegistration);
    } catch (error) {
      console.error("Webinar registration error", error);
      submitButton.disabled = false;
      submitLabel.textContent = "Register for free";
      status.style.color = "#c71929";
      status.textContent =
        error?.name === "AbortError"
          ? "Registration took too long. Please try again."
          : "Registration could not be completed. Please try again.";
    }
  });
})();
