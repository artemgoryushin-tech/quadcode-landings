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
    firstName: "Ingresa tu nombre.",
    email: "Ingresa un email de trabajo válido.",
    phoneLocal: "Ingresa un número de teléfono válido.",
    about: "Cuéntanos un poco sobre ti (mínimo 20 caracteres).",
    whyJoin: "Cuéntanos por qué quieres participar (mínimo 20 caracteres).",
    consent: "Confirma tu consentimiento para continuar.",
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
      message = messages[field.name] || "Completa este campo.";
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
      "18:00 UTC";

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
      status.textContent = "Revisa los campos resaltados.";
      status.style.color = "#c71929";
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const about = data.about?.trim() || "";
    const whyJoin = data.whyJoin?.trim() || "";
    const sessionStart =
      window.QuadcodeWebinarSchedule?.getNextSession?.()?.toISOString?.() || "";
    const registration = {
      registrationId:
        window.QuadcodeWebinarTracking?.createRegistrationId?.() ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      firstName: data.firstName?.trim() || "",
      lastName: "",
      email: data.email?.trim() || "",
      phone: data.phone?.trim() || data.phoneLocal?.trim() || "",
      phoneCountry: data.phoneCountry?.trim() || "MX",
      telegram: data.telegram?.trim() || "",
      about,
      whyJoin,
      motivation: `Sobre la persona:\n${about}\n\nMotivo para participar:\n${whyJoin}`,
      company: data.company?.trim() || "",
      country: "LATAM",
      registeredAt: new Date().toISOString(),
      sessionStart,
      sourceForm: "quadcode_latam_webinar",
    };

    submitButton.disabled = true;
    submitLabel.textContent = "Registrando…";
    status.style.color = "";
    status.textContent = "Enviando tu registro…";

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
          throw new Error("El servicio de registro no está disponible.");
        }
        await window.QuadcodeWebinarCRM.submit(completedRegistration);
      }

      if (!window.QuadcodeWebinarTracking) {
        try {
          localStorage.setItem(
            "quadcodeLatamWebinarRegistration",
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
        form_id: "quadcode_latam_webinar",
        registered_webinar: true,
        webinar_session_start: sessionStart,
        page_location: window.location.href,
      });

      showSuccess(completedRegistration);
    } catch (error) {
      console.error("Webinar registration error", error);
      submitButton.disabled = false;
      submitLabel.textContent = "Registrarme al webinar";
      status.style.color = "#c71929";
      status.textContent =
        error?.name === "AbortError"
          ? "El registro tardó demasiado. Inténtalo de nuevo."
          : "No pudimos completar el registro. Inténtalo de nuevo.";
    }
  });
})();
