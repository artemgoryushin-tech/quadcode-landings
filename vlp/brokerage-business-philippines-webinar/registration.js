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
    firstName: "Enter your first name.",
    email: "Enter a valid work email.",
    phoneLocal: "Enter a valid phone number.",
    about: "Tell us a little about yourself (at least 20 characters).",
    whyJoin: "Tell us why you’d like to join (at least 20 characters).",
    consent: "Please confirm your consent to continue.",
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
      window.QuadcodeWebinarSchedule?.formatSessionLabel?.() ||
      "12:00 GMT+3";

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
      status.textContent = "Please review the highlighted fields.";
      status.style.color = "#c71929";
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const about = data.about?.trim() || "";
    const whyJoin = data.whyJoin?.trim() || "";
    const registration = {
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
    };

    submitButton.disabled = true;
    submitLabel.textContent = "Registering…";
    status.style.color = "";
    status.textContent = "Sending your registration…";

    try {
      const isLocalPreview =
        window.location.protocol === "file:" ||
        ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

      if (!isLocalPreview) {
        if (!window.QuadcodeWebinarCRM?.submit) {
          throw new Error("Registration service is unavailable.");
        }
        await window.QuadcodeWebinarCRM.submit(registration);
      }

      try {
        localStorage.setItem(
          "quadcodePhilippinesWebinarRegistration",
          JSON.stringify(registration),
        );
      } catch {
        // Access still works when storage is unavailable.
      }

      window.dispatchEvent(
        new CustomEvent("quadcode:webinar-register", {
          detail: registration,
        }),
      );

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "lead_submit",
        form_id: "quadcode_philippines_webinar",
        lead_stage: "UC_SDFUX2",
        page_location: window.location.href,
      });

      showSuccess(registration);
    } catch (error) {
      console.error("Webinar registration error", error);
      submitButton.disabled = false;
      submitLabel.textContent = "Register for webinar";
      status.style.color = "#c71929";
      status.textContent =
        error?.name === "AbortError"
          ? "Registration took too long. Please try again."
          : "Could not send your registration. Please try again.";
    }
  });
})();
