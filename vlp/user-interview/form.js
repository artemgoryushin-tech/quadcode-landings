(function () {
  "use strict";

  const form = document.getElementById("interview-form");
  const card = document.querySelector(".application-card");
  const successState = document.getElementById("success-state");
  const status = document.getElementById("form-status");
  const submitButton = form?.querySelector("button[type='submit']");
  const recaptchaMount = document.getElementById("interview-recaptcha");
  const year = document.getElementById("current-year");
  const fieldNames = ["name", "country", "email", "phone", "telegram", "current_business", "brokerage_motivation", "agreement", "token"];
  const recaptchaSiteKey = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    : "6LceR2gjAAAAAIY2W8wlNB221ijjeTmLVfuFDma_";
  let recaptchaWidgetId = null;

  if (year) year.textContent = String(new Date().getFullYear());
  if (!form || !submitButton || !status) return;

  window.onUserInterviewRecaptchaReady = function () {
    if (!window.grecaptcha || !recaptchaMount || recaptchaWidgetId !== null) return;
    recaptchaWidgetId = window.grecaptcha.render(recaptchaMount, {
      sitekey: recaptchaSiteKey,
      callback: function () {
        clearFieldError("token");
        recaptchaMount.classList.remove("is-invalid");
      },
      "expired-callback": function () {
        setFieldError("token", "Please complete the security check again.");
        recaptchaMount.classList.add("is-invalid");
      },
    });
  };

  const captchaScript = document.createElement("script");
  captchaScript.src = "https://www.google.com/recaptcha/api.js?render=explicit&hl=en&onload=onUserInterviewRecaptchaReady";
  captchaScript.async = true;
  captchaScript.defer = true;
  captchaScript.onerror = function () {
    setStatus("The security check could not load. Please refresh the page and try again.");
  };
  document.head.appendChild(captchaScript);

  function getField(name) {
    return form.elements.namedItem(name);
  }

  function getError(name) {
    return form.querySelector(`[data-error-for="${name}"]`);
  }

  function setFieldError(name, message) {
    const input = getField(name);
    const error = getError(name);
    if (input?.closest(".field")) input.closest(".field").classList.add("is-invalid");
    if (input && "setAttribute" in input) input.setAttribute("aria-invalid", "true");
    if (error) {
      error.textContent = message;
      error.classList.add("is-visible");
    }
  }

  function clearFieldError(name) {
    const input = getField(name);
    const error = getError(name);
    if (input?.closest(".field")) input.closest(".field").classList.remove("is-invalid");
    if (input && "removeAttribute" in input) input.removeAttribute("aria-invalid");
    if (error) {
      error.textContent = "";
      error.classList.remove("is-visible");
    }
  }

  function clearErrors() {
    fieldNames.forEach(clearFieldError);
    recaptchaMount?.classList.remove("is-invalid");
    status.textContent = "";
    status.className = "form-status";
  }

  function setStatus(message) {
    status.textContent = message;
    status.className = "form-status is-error";
  }

  function validate() {
    clearErrors();
    const values = {
      name: String(getField("name")?.value || "").trim(),
      country: String(getField("country")?.value || "").trim(),
      email: String(getField("email")?.value || "").trim(),
      phone: String(getField("phone")?.value || "").trim(),
      telegram: String(getField("telegram")?.value || "").trim(),
      current_business: String(getField("current_business")?.value || "").trim(),
      brokerage_motivation: String(getField("brokerage_motivation")?.value || "").trim(),
      agreement: Boolean(getField("agreement")?.checked),
    };
    const token = recaptchaWidgetId !== null && window.grecaptcha
      ? window.grecaptcha.getResponse(recaptchaWidgetId)
      : "";
    let firstInvalid = null;

    if (values.name.length < 2) {
      setFieldError("name", "Please enter your full name.");
      firstInvalid ||= getField("name");
    }
    if (!values.country) {
      setFieldError("country", "Please enter your country or market.");
      firstInvalid ||= getField("country");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
      setFieldError("email", "Please enter a valid email address.");
      firstInvalid ||= getField("email");
    }
    const phoneDigits = values.phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setFieldError("phone", "Please enter a valid phone number with country code.");
      firstInvalid ||= getField("phone");
    }
    if (values.telegram && values.telegram.replace(/^@/, "").length < 2) {
      setFieldError("telegram", "Please enter your Telegram username.");
      firstInvalid ||= getField("telegram");
    }
    if (values.current_business.length < 3) {
      setFieldError("current_business", "Please tell us about your current business.");
      firstInvalid ||= getField("current_business");
    }
    if (values.brokerage_motivation.length < 5) {
      setFieldError("brokerage_motivation", "Please tell us what made you consider starting a brokerage.");
      firstInvalid ||= getField("brokerage_motivation");
    }
    if (!values.agreement) {
      setFieldError("agreement", "Please accept the terms to continue.");
      firstInvalid ||= getField("agreement");
    }
    if (!token) {
      setFieldError("token", "Please complete the security check.");
      recaptchaMount?.classList.add("is-invalid");
      firstInvalid ||= recaptchaMount;
    }

    if (firstInvalid) {
      firstInvalid.focus?.({ preventScroll: true });
      firstInvalid.scrollIntoView?.({ behavior: "smooth", block: "center" });
      return null;
    }

    return { ...values, token };
  }

  function attribution() {
    const params = new URLSearchParams(window.location.search);
    const stored = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(function (key) {
      const current = params.get(key);
      if (current) sessionStorage.setItem(`user_interview_${key}`, current);
      stored[key] = current || sessionStorage.getItem(`user_interview_${key}`) || "";
    });
    return stored;
  }

  form.addEventListener("input", function (event) {
    if (event.target?.name) clearFieldError(event.target.name);
  });

  form.addEventListener("change", function (event) {
    if (event.target?.name) clearFieldError(event.target.name);
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const values = validate();
    if (!values) return;

    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "Sending…";

    const payload = {
      ...values,
      company_website: String(getField("company_website")?.value || ""),
      ...attribution(),
      source_url: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer,
      language: document.documentElement.lang || "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    };

    try {
      const response = await fetch("./api/apply/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(function () { return null; });
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "We could not submit your application. Please try again.");
      }

      form.hidden = true;
      card?.classList.add("is-success");
      successState.hidden = false;
      successState.focus({ preventScroll: true });
      successState.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "We could not submit your application. Please try again.");
      if (recaptchaWidgetId !== null && window.grecaptcha) window.grecaptcha.reset(recaptchaWidgetId);
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "Apply for the $50 interview";
    }
  });
})();
