import crypto from "node:crypto";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serviceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const unquoteEnvValue = (value) => {
	const trimmed = value.trim();
	const quote = trimmed[0];
	if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
		return trimmed.slice(1, -1).replace(/\\n/g, "\n");
	}
	return trimmed;
};

const loadDotEnv = async () => {
	try {
		const raw = await fs.readFile(path.join(serviceRoot, ".env"), "utf8");
		for (const line of raw.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;

			const separator = trimmed.indexOf("=");
			if (separator < 1) continue;

			const key = trimmed.slice(0, separator).trim();
			if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || process.env[key] !== undefined) continue;

			process.env[key] = unquoteEnvValue(trimmed.slice(separator + 1));
		}
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
};

await loadDotEnv();

const config = {
	token: process.env.TELEGRAM_BOT_TOKEN || "",
	port: Number(process.env.PORT || 8080),
	host: process.env.HOST || "127.0.0.1",
	publicUrl: (process.env.PUBLIC_URL || "").replace(/\/+$/, ""),
	webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || "",
	dataFile: process.env.DATA_FILE || path.join(serviceRoot, "data", "state.json"),
	adminUsername: process.env.ADMIN_USERNAME || "admin",
	adminPassword: process.env.ADMIN_PASSWORD || "",
	moderationChatId: process.env.MODERATION_CHAT_ID || "",
	moderatorIds: new Set(
		(process.env.MODERATOR_TELEGRAM_IDS || "")
			.split(",")
			.map((value) => value.trim())
			.filter(Boolean),
	),
	moderatorUsername: (process.env.MODERATOR_USERNAME || "moderator_iG").replace(/^@/, ""),
	sheetsWebhookUrl: process.env.SHEETS_WEBHOOK_URL || "",
	sheetsWebhookSecret: process.env.SHEETS_WEBHOOK_SECRET || "",
	crmWebhookUrl: process.env.CRM_WEBHOOK_URL || "",
	crmWebhookSecret: process.env.CRM_WEBHOOK_SECRET || ""
};

const questions = [
	{
		key: "full_name",
		label: "Full name",
		prompt: "Please enter your first and last name."
	},
	{
		key: "instagram",
		label: "Instagram",
		prompt: "Share a link to your Instagram profile."
	},
	{
		key: "company",
		label: "Company",
		prompt: "Great, let's continue. Which company do you work for?"
	},
	{
		key: "position",
		label: "Position",
		prompt: "Next question: what is your role or job title?"
	},
	{
		key: "experience",
		label: "Experience and cases",
		prompt: "Last one: briefly tell us about your experience and key cases."
	}
];

const welcomeMessage =
	"Hi! I'm the iGaming chat bot. To join the discussion, please complete a short verification first. Let's begin.";
const receivedMessage = "Thank you! Your application has been received. We'll review the information shortly.";

const approvedMessage = () =>
	[
		"Hi!",
		"Thank you for completing the application.",
		"Your application has passed moderation — we're glad to welcome you to Trading Traffic Meetup.",
		"We'll send the event details and next steps here shortly.",
		`If you have any questions, contact @${config.moderatorUsername}💙`
	].join("\n");

const declinedMessage = () =>
	[
		"Hi!",
		"Thank you for completing the application.",
		"Unfortunately, your application did not pass moderation based on several criteria.",
		"Thank you for your understanding.",
		`If you have any questions, contact @${config.moderatorUsername}💙`
	].join("\n");

const statusLabels = {
	pending: "Pending",
	approved: "Approved",
	declined: "Declined"
};

const ensureRuntimeConfig = () => {
	const missing = [];
	if (!config.token) missing.push("TELEGRAM_BOT_TOKEN");
	if (!config.adminPassword) missing.push("ADMIN_PASSWORD");

	if (missing.length) {
		console.error(`Missing required env: ${missing.join(", ")}`);
		process.exit(1);
	}
};

const defaultState = () => ({
	applications: [],
	sessions: {},
	lastUpdateId: 0
});

const normalizeState = (state) => ({
	...defaultState(),
	...(state && typeof state === "object" ? state : {}),
	applications: Array.isArray(state?.applications) ? state.applications : [],
	sessions: state?.sessions && typeof state.sessions === "object" ? state.sessions : {}
});

const readState = async () => {
	try {
		const raw = await fs.readFile(config.dataFile, "utf8");
		return normalizeState(JSON.parse(raw));
	} catch (error) {
		if (error.code === "ENOENT") return defaultState();
		throw error;
	}
};

const writeState = async (state) => {
	await fs.mkdir(path.dirname(config.dataFile), { recursive: true });
	const tmpPath = `${config.dataFile}.${process.pid}.${Date.now()}.tmp`;
	await fs.writeFile(tmpPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
	await fs.rename(tmpPath, config.dataFile);
};

let writeQueue = Promise.resolve();

const updateState = (mutator) => {
	writeQueue = writeQueue.catch(() => undefined).then(async () => {
		const state = await readState();
		const result = await mutator(state);
		await writeState(state);
		return result;
	});
	return writeQueue;
};

const escapeHtml = (value) =>
	String(value ?? "").replace(/[&<>"']/g, (char) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	})[char]);

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const readRequestBody = async (request, maxBytes = 1024 * 1024) => {
	let body = "";
	for await (const chunk of request) {
		body += chunk;
		if (Buffer.byteLength(body) > maxBytes) {
			throw new Error("Request body too large");
		}
	}
	return body;
};

const readJsonBody = async (request) => {
	const body = await readRequestBody(request);
	if (!body.trim()) return {};
	return JSON.parse(body);
};

const sendJson = (response, status, payload) => {
	response.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store"
	});
	response.end(JSON.stringify(payload));
};

const sendHtml = (response, status, html) => {
	response.writeHead(status, {
		"content-type": "text/html; charset=utf-8",
		"cache-control": "no-store"
	});
	response.end(html);
};

const redirect = (response, location) => {
	response.writeHead(303, { location });
	response.end();
};

const parseBasicAuth = (request) => {
	const header = request.headers.authorization || "";
	if (!header.startsWith("Basic ")) return null;

	const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
	const separator = decoded.indexOf(":");
	if (separator < 0) return null;

	return {
		username: decoded.slice(0, separator),
		password: decoded.slice(separator + 1)
	};
};

const sameSecret = (actual, expected) => {
	const left = Buffer.from(String(actual));
	const right = Buffer.from(String(expected));
	return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const isAdminAuthorized = (request) => {
	const auth = parseBasicAuth(request);
	return (
		auth &&
		sameSecret(auth.username, config.adminUsername) &&
		sameSecret(auth.password, config.adminPassword)
	);
};

const requireAdmin = (request, response) => {
	if (isAdminAuthorized(request)) return true;

	response.writeHead(401, {
		"www-authenticate": 'Basic realm="Trading Traffic Meetup moderation"',
		"content-type": "text/plain; charset=utf-8"
	});
	response.end("Authentication required.");
	return false;
};

const telegram = async (method, payload = {}) => {
	const response = await fetch(`https://api.telegram.org/bot${config.token}/${method}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload)
	});
	const text = await response.text();
	const parsed = text ? JSON.parse(text) : {};

	if (!response.ok || parsed.ok === false) {
		throw new Error(parsed.description || `Telegram API error: ${response.status}`);
	}

	return parsed.result;
};

const sendTelegramMessage = (chatId, text, extra = {}) =>
	telegram("sendMessage", {
		chat_id: chatId,
		text,
		disable_web_page_preview: true,
		...extra
	});

const postJson = async (url, payload, secret = "", secretPlacement = "header") => {
	if (!url) return null;
	const endpoint = new URL(url);
	if (secret && secretPlacement === "query") {
		endpoint.searchParams.set("secret", secret);
	}

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...(secret && secretPlacement === "header" ? { "x-webhook-secret": secret } : {})
		},
		body: JSON.stringify(payload)
	});
	const text = await response.text();

	if (!response.ok) {
		throw new Error(`Webhook ${url} failed with ${response.status}: ${text.slice(0, 500)}`);
	}

	if (!text) return null;

	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
};

const telegramUser = (from = {}, chat = {}) => ({
	id: from.id || chat.id,
	chatId: chat.id,
	username: from.username || "",
	firstName: from.first_name || "",
	lastName: from.last_name || "",
	languageCode: from.language_code || ""
});

const truncate = (value, max = 3000) => {
	const text = String(value || "").trim();
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

const createApplicationId = (state) => {
	let id = "";
	do {
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		id = `ttm-${date}-${crypto.randomBytes(3).toString("hex")}`;
	} while (state.applications.some((application) => application.id === id));
	return id;
};

const latestApplicationForChat = (state, chatId) =>
	state.applications
		.filter((application) => String(application.chatId) === String(chatId))
		.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];

const parseStartPayload = (text) => {
	const [, payload = ""] = String(text || "").trim().split(/\s+/, 2);
	return /^[A-Za-z0-9_-]{1,64}$/.test(payload) ? payload : "";
};

const markUpdateSeen = (updateId) => {
	if (!Number.isInteger(updateId)) return Promise.resolve(false);

	return updateState((state) => {
		if (updateId <= Number(state.lastUpdateId || 0)) return true;
		state.lastUpdateId = updateId;
		return false;
	});
};

const handleStart = (state, message, leadId = "") => {
	const chatId = message.chat.id;
	state.sessions[chatId] = {
		step: 0,
		leadId,
		answers: {},
		user: telegramUser(message.from, message.chat),
		startedAt: new Date().toISOString()
	};

	return {
		messages: [welcomeMessage, questions[0].prompt]
	};
};

const handleCancel = (state, message) => {
	delete state.sessions[message.chat.id];
	return {
		messages: ["Your application form has been reset. Send /start to begin again."]
	};
};

const handleStatus = (state, message) => {
	const application = latestApplicationForChat(state, message.chat.id);
	if (!application) {
		return { messages: ["You don't have a submitted application yet. Send /start to begin."] };
	}

	const label = statusLabels[application.status] || application.status;
	return { messages: [`Your latest application status: ${label}.`] };
};

const buildApplication = (state, session, message) => {
	const id = createApplicationId(state);
	const now = new Date().toISOString();

	return {
		id,
		status: "pending",
		createdAt: now,
		updatedAt: now,
		leadId: session.leadId || "",
		source: "telegram_bot",
		chatId: message.chat.id,
		user: {
			...session.user,
			...telegramUser(message.from, message.chat)
		},
		answers: { ...session.answers },
		timeline: [
			{
				at: now,
				action: "submitted",
				by: "bot"
			}
		]
	};
};

const handleQuestionAnswer = (state, message) => {
	const chatId = message.chat.id;
	const session = state.sessions[chatId];

	if (!session) {
		return { messages: ["Send /start to complete verification."] };
	}

	const stepIndex = Number(session.step || 0);
	const question = questions[stepIndex];
	const answer = truncate(message.text);

	if (!answer) {
		return { messages: [question.prompt] };
	}

	session.answers[question.key] = answer;
	session.step = stepIndex + 1;
	session.updatedAt = new Date().toISOString();

	if (session.step < questions.length) {
		return { messages: [questions[session.step].prompt] };
	}

	const application = buildApplication(state, session, message);
	state.applications.unshift(application);
	delete state.sessions[chatId];

	return {
		messages: [receivedMessage],
		application
	};
};

const handleMessage = async (message) => {
	const text = String(message.text || "").trim();
	if (!text) return;

	const result = await updateState((state) => {
		if (text.startsWith("/start")) return handleStart(state, message, parseStartPayload(text));
		if (text.startsWith("/cancel")) return handleCancel(state, message);
		if (text.startsWith("/status")) return handleStatus(state, message);
		return handleQuestionAnswer(state, message);
	});

	for (const outgoing of result.messages || []) {
		await sendTelegramMessage(message.chat.id, outgoing);
	}

	if (result.application) {
		void syncIntegrations(result.application, "submitted");
		await notifyModeration(result.application);
	}
};

const externalApplicationRecord = (application, eventType) => {
	const answers = application.answers || {};
	const user = application.user || {};

	return {
		event_type: eventType,
		application_id: application.id,
		event_lead_id: application.leadId || "",
		status: application.status,
		created_at: application.createdAt || "",
		updated_at: application.updatedAt || "",
		reviewed_at: application.reviewedAt || "",
		reviewed_by: application.reviewedBy || "",
		decision_sent_at: application.decisionSentAt || "",
		full_name: answers.full_name || "",
		instagram: answers.instagram || "",
		company: answers.company || "",
		position: answers.position || "",
		experience: answers.experience || "",
		telegram_username: user.username ? `@${user.username}` : "",
		telegram_user_id: user.id || application.chatId || "",
		telegram_chat_id: application.chatId || "",
		source: application.source || "telegram_bot"
	};
};

const syncIntegrations = async (application, eventType) => {
	const payload = externalApplicationRecord(application, eventType);

	await Promise.allSettled([
		config.sheetsWebhookUrl
			? postJson(config.sheetsWebhookUrl, payload, config.sheetsWebhookSecret, "query")
			: Promise.resolve(null),
		config.crmWebhookUrl
			? postJson(config.crmWebhookUrl, payload, config.crmWebhookSecret)
			: Promise.resolve(null)
	]).then((results) => {
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				console.error(index === 0 ? "Sheets sync failed" : "CRM sync failed", result.reason);
			}
		});
	});
};

const renderAnswerLines = (application) =>
	questions
		.map((question) => `<b>${escapeHtml(question.label)}:</b>\n${escapeHtml(application.answers?.[question.key] || "—")}`)
		.join("\n\n");

const renderModerationMessage = (application) => {
	const user = application.user || {};
	const username = user.username ? `@${user.username}` : "—";
	const status = statusLabels[application.status] || application.status;

	return [
		"<b>Trading Traffic Meetup application</b>",
		`ID: <code>${escapeHtml(application.id)}</code>`,
		`Lead sync ID: <code>${escapeHtml(application.leadId || "—")}</code>`,
		`Status: <b>${escapeHtml(status)}</b>`,
		`Telegram: ${escapeHtml(username)} / <code>${escapeHtml(user.id || application.chatId)}</code>`,
		`Created: ${escapeHtml(application.createdAt)}`,
		"",
		renderAnswerLines(application)
	].join("\n");
};

const notifyModeration = async (application) => {
	if (!config.moderationChatId) return;

	try {
		await sendTelegramMessage(config.moderationChatId, renderModerationMessage(application), {
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [
					[
						{ text: "Approve", callback_data: `app:approve:${application.id}` },
						{ text: "Disapprove", callback_data: `app:decline:${application.id}` }
					]
				]
			}
		});
	} catch (error) {
		console.error("Could not notify moderation chat", error);
	}
};

const reviewApplication = async (id, decision, reviewer) => {
	const status = decision === "approve" ? "approved" : "declined";
	const now = new Date().toISOString();
	const result = await updateState((state) => {
		const application = state.applications.find((item) => item.id === id);
		if (!application) return { ok: false, message: "Application not found." };
		if (application.status !== "pending") {
			return { ok: false, message: `Application is already ${application.status}.`, application };
		}

		application.status = status;
		application.reviewedAt = now;
		application.reviewedBy = reviewer;
		application.updatedAt = now;
		application.timeline = application.timeline || [];
		application.timeline.push({ at: now, action: status, by: reviewer });
		return { ok: true, application };
	});

	if (!result.ok) return result;

	try {
		await sendTelegramMessage(
			result.application.chatId,
			status === "approved" ? approvedMessage() : declinedMessage()
		);
		const sentApplication = await updateState((state) => {
			const application = state.applications.find((item) => item.id === id);
			if (!application) return result.application;
			application.decisionSentAt = new Date().toISOString();
			application.updatedAt = application.decisionSentAt;
			return application;
		});
		void syncIntegrations(sentApplication || result.application, status);
		return { ...result, application: sentApplication || result.application, sent: true };
	} catch (error) {
		console.error("Could not send moderation decision", error);
		void syncIntegrations(result.application, status);
		return { ...result, sent: false, message: "Status saved, but Telegram message was not sent." };
	}
};

const handleCallbackQuery = async (callbackQuery) => {
	const data = String(callbackQuery.data || "");
	const match = data.match(/^app:(approve|decline):(.+)$/);
	if (!match) return;

	const [, decision, id] = match;
	const fromId = String(callbackQuery.from?.id || "");

	if (config.moderatorIds.size && !config.moderatorIds.has(fromId)) {
		await telegram("answerCallbackQuery", {
			callback_query_id: callbackQuery.id,
			text: "You are not allowed to moderate applications.",
			show_alert: true
		});
		return;
	}

	const reviewer = callbackQuery.from?.username
		? `telegram:@${callbackQuery.from.username}`
		: `telegram:${fromId}`;
	const result = await reviewApplication(id, decision, reviewer);

	await telegram("answerCallbackQuery", {
		callback_query_id: callbackQuery.id,
		text: result.ok ? "Decision sent." : result.message
	});

	if (callbackQuery.message && result.application) {
		await telegram("editMessageText", {
			chat_id: callbackQuery.message.chat.id,
			message_id: callbackQuery.message.message_id,
			text: renderModerationMessage(result.application),
			parse_mode: "HTML",
			reply_markup: { inline_keyboard: [] }
		});
	}
};

const processUpdate = async (update) => {
	const duplicate = await markUpdateSeen(update.update_id);
	if (duplicate) return;

	if (update.message) {
		await handleMessage(update.message);
		return;
	}

	if (update.callback_query) {
		await handleCallbackQuery(update.callback_query);
	}
};

const renderAdminPage = (state, notice = "") => {
	const applications = [...state.applications].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
	const rows = applications.length
		? applications
				.map((application) => {
					const user = application.user || {};
					const username = user.username ? `@${user.username}` : "—";
					const disabled = application.status !== "pending" ? "disabled" : "";

					return `
						<tr>
							<td><code>${escapeHtml(application.id)}</code><small>${escapeHtml(application.createdAt)}</small></td>
							<td><span class="status status-${escapeHtml(application.status)}">${escapeHtml(statusLabels[application.status] || application.status)}</span></td>
							<td><code>${escapeHtml(application.leadId || "—")}</code></td>
							<td>${escapeHtml(application.answers?.full_name || "—")}</td>
							<td>${escapeHtml(username)}</td>
							<td>${escapeHtml(application.answers?.company || "—")}</td>
							<td>${escapeHtml(application.answers?.position || "—")}</td>
							<td class="actions">
								<form method="post" action="/admin/applications/${encodeURIComponent(application.id)}/approve">
									<button ${disabled}>Approve</button>
								</form>
								<form method="post" action="/admin/applications/${encodeURIComponent(application.id)}/decline">
									<button class="secondary" ${disabled}>Disapprove</button>
								</form>
							</td>
						</tr>
						<tr class="details-row">
							<td colspan="8">
								<details>
									<summary>Answers and moderation details</summary>
									<div class="details-grid">
										<div><b>Instagram</b><p>${escapeHtml(application.answers?.instagram || "—")}</p></div>
										<div><b>Experience and cases</b><p>${escapeHtml(application.answers?.experience || "—")}</p></div>
										<div><b>Telegram ID</b><p>${escapeHtml(user.id || application.chatId || "—")}</p></div>
										<div><b>Reviewed</b><p>${escapeHtml(application.reviewedAt || "—")} ${application.reviewedBy ? `by ${escapeHtml(application.reviewedBy)}` : ""}</p></div>
									</div>
								</details>
							</td>
						</tr>
					`;
				})
				.join("")
		: '<tr><td colspan="8" class="empty">No applications yet.</td></tr>';

	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Trading Traffic Meetup Moderation</title>
	<style>
		:root { color-scheme: light; --ink: #111; --muted: #6b7280; --line: #e5e7eb; --bg: #f6f7f9; --panel: #fff; --blue: #315cf6; --red: #b42318; --green: #167042; }
		* { box-sizing: border-box; }
		body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
		main { width: min(1440px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 56px; }
		header { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
		h1 { margin: 0; font-size: clamp(28px, 4vw, 52px); letter-spacing: -0.04em; line-height: 0.95; }
		.header-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
		a, button { border-radius: 8px; }
		.header-actions a, button { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; border: 1px solid transparent; padding: 0 14px; background: var(--blue); color: #fff; font-weight: 800; text-decoration: none; cursor: pointer; }
		.header-actions a.secondary, button.secondary { border-color: var(--line); background: #fff; color: var(--ink); }
		button:disabled { cursor: not-allowed; opacity: 0.4; }
		.notice { margin: 0 0 16px; border: 1px solid rgba(49, 92, 246, 0.22); border-radius: 8px; padding: 12px 14px; background: rgba(49, 92, 246, 0.08); color: var(--blue); font-weight: 800; }
		.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
		table { width: 100%; border-collapse: collapse; min-width: 980px; }
		th, td { border-bottom: 1px solid var(--line); padding: 14px; text-align: left; vertical-align: top; font-size: 14px; }
		th { background: #fafafa; color: var(--muted); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
		td small { display: block; margin-top: 6px; color: var(--muted); }
		.status { display: inline-flex; align-items: center; min-height: 26px; border-radius: 999px; padding: 0 10px; font-size: 12px; font-weight: 900; }
		.status-pending { background: #fff7ed; color: #9a3412; }
		.status-approved { background: #ecfdf3; color: var(--green); }
		.status-declined { background: #fff1f1; color: var(--red); }
		.actions { display: flex; gap: 8px; }
		.actions form { margin: 0; }
		.details-row td { padding-top: 0; background: #fcfcfd; }
		details { color: var(--muted); }
		summary { cursor: pointer; font-weight: 800; }
		.details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 14px 0 4px; }
		.details-grid b { color: var(--ink); }
		.details-grid p { white-space: pre-wrap; margin: 6px 0 0; line-height: 1.45; }
		.empty { color: var(--muted); text-align: center; }
		@media (max-width: 720px) { header { display: grid; } .header-actions { justify-content: start; } .details-grid { grid-template-columns: 1fr; } }
	</style>
</head>
<body>
	<main>
		<header>
			<div>
				<h1>Trading Traffic Meetup Moderation</h1>
				<p>${applications.length} total applications</p>
			</div>
			<div class="header-actions">
				<a href="/admin/export.csv">Export CSV</a>
				<a class="secondary" href="/health">Health</a>
			</div>
		</header>
		${notice ? `<p class="notice">${escapeHtml(notice)}</p>` : ""}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Status</th>
						<th>Lead sync ID</th>
						<th>Name</th>
						<th>Telegram</th>
						<th>Company</th>
						<th>Position</th>
						<th>Moderate</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
			</table>
		</div>
	</main>
</body>
</html>`;
};

const exportApplicationsCsv = (applications) => {
	const headers = [
		"id",
		"status",
		"createdAt",
		"reviewedAt",
		"decisionSentAt",
		"event_lead_id",
		"full_name",
		"instagram",
		"company",
		"position",
		"experience",
		"telegram_username",
		"telegram_user_id",
		"chat_id"
	];
	const rows = applications.map((application) => [
		application.id,
		application.status,
		application.createdAt,
		application.reviewedAt,
		application.decisionSentAt,
		application.leadId,
		application.answers?.full_name,
		application.answers?.instagram,
		application.answers?.company,
		application.answers?.position,
		application.answers?.experience,
		application.user?.username,
		application.user?.id,
		application.chatId
	]);
	return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
};

const handleAdmin = async (request, response, url) => {
	if (!requireAdmin(request, response)) return;

	const reviewMatch = url.pathname.match(/^\/admin\/applications\/([^/]+)\/(approve|decline)$/);
	if (request.method === "POST" && reviewMatch) {
		const [, id, decision] = reviewMatch;
		const result = await reviewApplication(decodeURIComponent(id), decision, `admin:${config.adminUsername}`);
		const notice = encodeURIComponent(result.message || (result.sent ? "Decision sent." : "Decision saved."));
		redirect(response, `/admin?notice=${notice}`);
		return;
	}

	if (request.method === "GET" && url.pathname === "/admin/export.csv") {
		const state = await readState();
		response.writeHead(200, {
			"content-type": "text/csv; charset=utf-8",
			"content-disposition": 'attachment; filename="trading-traffic-applications.csv"',
			"cache-control": "no-store"
		});
		response.end(`${exportApplicationsCsv(state.applications)}\n`);
		return;
	}

	if (request.method === "GET" && url.pathname === "/admin") {
		const state = await readState();
		sendHtml(response, 200, renderAdminPage(state, url.searchParams.get("notice") || ""));
		return;
	}

	sendJson(response, 404, { success: false, message: "Not found." });
};

const handleTelegramWebhook = async (request, response) => {
	if (config.webhookSecret) {
		const secret = request.headers["x-telegram-bot-api-secret-token"] || "";
		if (!sameSecret(secret, config.webhookSecret)) {
			sendJson(response, 401, { success: false, message: "Invalid webhook secret." });
			return;
		}
	}

	const update = await readJsonBody(request);
	await processUpdate(update);
	sendJson(response, 200, { ok: true });
};

const setWebhook = async () => {
	if (!config.publicUrl) {
		throw new Error("PUBLIC_URL is required for webhook mode.");
	}

	return telegram("setWebhook", {
		url: `${config.publicUrl}/telegram/webhook`,
		allowed_updates: ["message", "callback_query"],
		...(config.webhookSecret ? { secret_token: config.webhookSecret } : {})
	});
};

const startPolling = async () => {
	console.log("PUBLIC_URL is not set. Starting Telegram long polling.");
	await telegram("deleteWebhook", { drop_pending_updates: false });

	for (;;) {
		try {
			const state = await readState();
			const updates = await telegram("getUpdates", {
				timeout: 25,
				offset: Number(state.lastUpdateId || 0) + 1,
				allowed_updates: ["message", "callback_query"]
			});

			for (const update of updates) {
				await processUpdate(update);
			}
		} catch (error) {
			console.error("Polling error", error);
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
	}
};

const server = http.createServer(async (request, response) => {
	try {
		const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

		if (url.pathname === "/health") {
			sendJson(response, 200, { ok: true, service: "quadcode-trading-traffic-bot" });
			return;
		}

		if (url.pathname === "/") {
			redirect(response, "/admin");
			return;
		}

		if (url.pathname.startsWith("/admin")) {
			await handleAdmin(request, response, url);
			return;
		}

		if (request.method === "POST" && url.pathname === "/telegram/webhook") {
			await handleTelegramWebhook(request, response);
			return;
		}

		if (request.method === "GET" && url.pathname === "/telegram/set-webhook") {
			if (!requireAdmin(request, response)) return;
			await setWebhook();
			sendJson(response, 200, { ok: true, webhook: `${config.publicUrl}/telegram/webhook` });
			return;
		}

		if (request.method === "GET" && url.pathname === "/telegram/delete-webhook") {
			if (!requireAdmin(request, response)) return;
			await telegram("deleteWebhook", { drop_pending_updates: false });
			sendJson(response, 200, { ok: true });
			return;
		}

		sendJson(response, 404, { success: false, message: "Not found." });
	} catch (error) {
		console.error("Request error", error);
		sendJson(response, 500, { success: false, message: "Internal server error." });
	}
});

ensureRuntimeConfig();
await fs.mkdir(path.dirname(config.dataFile), { recursive: true });

server.listen(config.port, config.host, async () => {
	console.log(`Trading Traffic Meetup bot is listening on ${config.host}:${config.port}`);
	console.log(`Admin panel: http://${config.host}:${config.port}/admin`);

	if (config.publicUrl) {
		try {
			await setWebhook();
			console.log(`Telegram webhook set to ${config.publicUrl}/telegram/webhook`);
		} catch (error) {
			console.error("Could not set Telegram webhook", error);
		}
	} else {
		void startPolling();
	}
});
