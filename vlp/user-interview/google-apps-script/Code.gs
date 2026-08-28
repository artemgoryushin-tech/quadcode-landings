const SPREADSHEET_ID = "1c-qyqQjw-URZl_C0rCM8IiCL7gkKv9A2Gbszg9ZUZHA";
const SHEET_NAME = "Applications";

const HEADERS = [
  "submitted_at",
  "application_id",
  "status",
  "full_name",
  "email",
  "phone",
  "telegram",
  "country",
  "current_business",
  "brokerage_motivation",
  "language",
  "timezone",
  "source_url",
  "page_path",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content"
];

function doPost(e) {
  try {
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    const requestSecret = String(e && e.parameter && e.parameter.secret || "");
    if (expectedSecret && requestSecret !== expectedSecret) {
      return jsonResponse({ ok: false, message: "Unauthorized" });
    }

    const payload = JSON.parse(e.postData.contents || "{}");
    saveApplication(payload);
    return jsonResponse({ ok: true, application_id: payload.application_id });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message });
  }
}

function saveApplication(payload) {
  const applicationId = String(payload.application_id || "").trim();
  if (!applicationId) throw new Error("application_id is required");

  const sheet = getApplicationsSheet();
  ensureHeaders(sheet);
  const row = HEADERS.map(function (header) {
    if (header === "submitted_at") return safeDate(payload[header]);
    return safeCellValue(payload[header]);
  });
  sheet.appendRow(row);
}

function getApplicationsSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const differs = HEADERS.some(function (header, index) {
    return current[index] !== header;
  });
  if (differs) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function safeCellValue(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeDate(value) {
  const date = new Date(String(value || ""));
  return isNaN(date.getTime()) ? new Date() : date;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
