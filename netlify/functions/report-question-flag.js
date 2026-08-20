import { google } from "googleapis";

const SHEET_NAME = "Flags";
const HEADER_ROW = [
  "Timestamp",
  "Unit",
  "Chapter",
  "Quiz direction",
  "Arabic word",
  "Correct answer",
  "Status"
];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function credentialsFromEnvironment() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing Google service-account credentials.");
  const credentials = JSON.parse(raw);
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Incomplete Google service-account credentials.");
  }
  return credentials;
}

async function ensureHeaderRow(sheets, spreadsheetId) {
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:G1`
  });
  if (existing.data.values && existing.data.values.length) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:G1`,
    valueInputOption: "RAW",
    requestBody: { values: [HEADER_ROW] }
  });
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return json({ error: "Invalid request body." }, 400);
  }

  const unitId = cleanText(body.unitId, 80);
  const chapterId = cleanText(body.chapterId, 80);
  const mode = body.mode === "en-to-ar" ? "English-to-Arabic" : "Arabic-to-English";
  const arabic = cleanText(body.arabic, 300);
  const correctAnswer = cleanText(body.correctAnswer, 500);
  const timestamp = cleanText(body.timestamp, 80) || new Date().toISOString();

  if (!unitId || !chapterId || !arabic || !correctAnswer) {
    return json({ error: "Missing required flag details." }, 400);
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return json({ error: "Flag reporting is not configured." }, 503);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: credentialsFromEnvironment(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    const sheets = google.sheets({ version: "v4", auth });
    await ensureHeaderRow(sheets, spreadsheetId);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[timestamp, unitId, chapterId, mode, arabic, correctAnswer, "New"]]
      }
    });
    return json({ ok: true });
  } catch (error) {
    console.error("Unable to append anonymous word flag:", error.message);
    return json({ error: "Unable to submit flag right now." }, 503);
  }
};

export const config = { path: "/api/report-question-flag" };
