const TELEGRAM_BOT_URL = "https://t.me/quadcode_events_bot";
const FORMS_API_URL = "https://quadcode.foach.site";
const FORMS_API_ENDPOINT = "/api/notPopup";
const UTM_FIELDS = ["utm_campaign", "utm_medium", "utm_source", "utm_content", "utm_term"];

const form = document.querySelector(".event-apply-form");
const statusNode = document.querySelector("[data-event-form-status]");
const nextStep = document.querySelector("[data-telegram-next]");
const telegramCta = document.querySelector("[data-telegram-cta]");

const readString = (formData, key) => String(formData.get(key) || "").trim();

const createLeadId = () => {
	const random = window.crypto?.randomUUID
		? window.crypto.randomUUID().replace(/-/g, "").slice(0, 16)
		: Math.random().toString(36).slice(2, 14);
	return `ttm_${Date.now().toString(36)}_${random}`;
};

const buildTelegramUrl = (leadId) => {
	const url = new URL(TELEGRAM_BOT_URL);
	if (leadId) url.searchParams.set("start", leadId);
	return url.toString();
};

const getCookieByName = (name) => {
	const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : "";
};

const getStoredAttribution = () => {
	const data = {};
	const urlParams = new URLSearchParams(window.location.search);

	urlParams.forEach((value, key) => {
		localStorage.setItem(`param__${key}`, value);
	});

	UTM_FIELDS.forEach((key) => {
		const value = localStorage.getItem(`param__${key}`);
		if (value) data[key] = value;
	});

	const currentUrl = new URL(window.location.href);
	data.lang_by_browser = window.navigator.language || "en";
	data.lang = document.documentElement.lang || window.navigator.language || "en";
	data.landing_url = `${currentUrl.host}${currentUrl.pathname}`;
	data.referrer = document.referrer || data.landing_url;

	const roistatId = getCookieByName("roistat_visit");
	if (roistatId) data.roistat_id = roistatId;

	return data;
};

const setStatus = (message, type = "idle") => {
	if (!statusNode) return;
	statusNode.textContent = message;
	statusNode.classList.toggle("is-success", type === "success");
	statusNode.classList.toggle("is-error", type === "error");
};

const getValidationMessage = (errors) => {
	const [field, messages] = Object.entries(errors || {})[0] || [];
	if (!field) return "Please check the form fields and try again.";

	const labels = {
		first_name: "Name",
		email: "Email",
		tg: "Telegram",
		phone: "WhatsApp",
		event_about: "Tell about yourself",
		event_why_join: "Why would you like to join",
		event_experience: "Experience"
	};
	const label = labels[field] || field.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
	const message = Array.isArray(messages) ? messages[0] : messages;
	return `${label}: ${message || "Invalid value"}`;
};

const buildPayload = (targetForm, leadId) => {
	const formData = new FormData(targetForm);
	const about = readString(formData, "about");
	const whyJoin = readString(formData, "why_join");
	const experience = readString(formData, "experience");
	const telegramBotUrl = buildTelegramUrl(leadId);
	const shortBio = [
		`Lead sync ID: ${leadId}`,
		`Telegram bot link: ${telegramBotUrl}`,
		`Tell about yourself:\n${about}`,
		`Why would you like to join:\n${whyJoin}`,
		`Experience in trading / affiliate market:\n${experience}`
	].join("\n\n");

	return {
		first_name: readString(formData, "name"),
		email: readString(formData, "email"),
		phone: readString(formData, "phone"),
		tg: readString(formData, "telegram"),
		company_name: "Trading Traffic Meetup applicant",
		current_business: "Trading Traffic Meetup applicant",
		why_launch: shortBio,
		short_bio: shortBio,
		comment: shortBio,
		phone_country: readString(formData, "phone_country"),
		event_lead_id: leadId,
		telegram_bot_url: telegramBotUrl,
		event_about: about,
		event_why_join: whyJoin,
		event_experience: experience,
		lead_source: "quadcode_trading_traffic_meetup",
		source: "quadcode_trading_traffic_meetup",
		source_form: "quadcode_trading_traffic_meetup",
		source_site: "Quadcode Trading Traffic Meetup",
		terms_agree: true,
		activeCampaignDisable: true,
		...getStoredAttribution()
	};
};

const submitLead = async (payload) => {
	const response = await fetch(`${FORMS_API_URL}${FORMS_API_ENDPOINT}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			"X-Requested-With": "XMLHttpRequest"
		},
		body: JSON.stringify(payload)
	});

	if (response.ok || response.status === 422) {
		return response.json();
	}

	throw new Error(await response.text());
};

const trackLeadSubmit = (extra = {}) => {
	window.dataLayer = window.dataLayer || [];
	const eventId = `lead_event-form_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

	window.dataLayer.push({
		event: "lead_submit",
		event_id: eventId,
		form_id: "event-form",
		page_location: window.location.href,
		page_path: window.location.pathname,
		page_language: document.documentElement.lang || "en",
		...extra
	});
};

const showTelegramNextStep = (telegramUrl) => {
	form.classList.add("is-submitted");
	if (nextStep) nextStep.hidden = false;
	if (telegramCta) telegramCta.href = telegramUrl;
	telegramCta?.focus();
};

form?.addEventListener(
	"submit",
	async (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (!form.reportValidity()) return;

		const submitButton = form.querySelector('[type="submit"]');
		const leadId = createLeadId();
		const telegramUrl = buildTelegramUrl(leadId);
		const payload = buildPayload(form, leadId);

		try {
			form.classList.add("is-loading");
			form.setAttribute("aria-busy", "true");
			submitButton?.setAttribute("disabled", "disabled");
			setStatus("Sending application...");

			const result = await submitLead(payload);

			if (result && "errors" in result) {
				setStatus(getValidationMessage(result.errors), "error");
				return;
			}

			trackLeadSubmit({
				utm_source: payload.utm_source,
				utm_campaign: payload.utm_campaign,
				event_lead_id: leadId,
				next_step: "telegram_bot_required"
			});
			form.reset();
			setStatus(
				"Thanks. Your application has been submitted. Please continue in Telegram to complete confirmation and verification.",
				"success"
			);
			showTelegramNextStep(telegramUrl);
		} catch (error) {
			console.error("Trading Traffic Meetup form submit error", error);
			setStatus("Could not send the application. Please try again.", "error");
		} finally {
			form.classList.remove("is-loading");
			form.removeAttribute("aria-busy");
			submitButton?.removeAttribute("disabled");
		}
	},
	{ capture: true }
);
