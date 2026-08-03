const SPREADSHEET_ID = "1I3W0FJlE_arAUuNsmsZguBn8YVsafO9xhuiAcw8k2D0";
const SHEET_NAME = "Applications";

const HEADERS = [
  "application_id",
  "event_lead_id",
  "event_type",
  "status",
  "created_at",
  "updated_at",
  "reviewed_at",
  "reviewed_by",
  "decision_sent_at",
  "full_name",
  "instagram",
  "company",
  "position",
  "experience",
  "telegram_username",
  "telegram_user_id",
  "telegram_chat_id",
  "source"
];

function doPost(e) {
  try {
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    const requestSecret = e.parameter.secret || "";
    if (expectedSecret && requestSecret !== expectedSecret) {
      return jsonResponse({ ok: false, message: "Unauthorized" }, 401);
    }

    const payload = JSON.parse(e.postData.contents || "{}");
    upsertApplication(payload);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message }, 500);
  }
}

function upsertApplication(payload) {
  const sheet = getApplicationsSheet();
  const id = String(payload.application_id || "").trim();
  if (!id) throw new Error("application_id is required");

  ensureHeaders(sheet);

  const rowIndex = findRowByApplicationId(sheet, id);
  const row = HEADERS.map((header) => payload[header] || "");

  if (rowIndex) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function getApplicationsSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const existing = headerRange.getValues()[0];
  const isDifferent = HEADERS.some((header, index) => existing[index] !== header);

  if (isDifferent) {
    headerRange.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function findRowByApplicationId(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const index = values.findIndex((row) => String(row[0]) === id);
  return index >= 0 ? index + 2 : 0;
}

function jsonResponse(payload, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify({ statusCode: statusCode || 200, ...payload }))
    .setMimeType(ContentService.MimeType.JSON);
}
