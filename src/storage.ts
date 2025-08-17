import { Bot } from "grammy";
import { google } from "googleapis";
import { Mode, MyContext } from "./types";

const CREDENTIALS = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};
console.log("🔑 Service Account Email:", CREDENTIALS.client_email);
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "UserModes";

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function ensureSheetExists(): Promise<void> {
  try {
    // First, check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SHEET_NAME
    );

    if (!sheet) {
      // Create new sheet with headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: SHEET_NAME },
              },
            },
          ],
        },
      });

      // Add headers to new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:C1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["UserId", "Mode", "Timestamp"]],
        },
      });
      console.log("📝 Created new sheet with headers");
    }
  } catch (error: any) {
    console.error("❌ Error setting up sheet:", error.message);
    throw error;
  }
}

async function loadStorageMap(): Promise<Record<string, Mode>> {
  try {
    // First ensure sheet exists
    await ensureSheetExists();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:C`,
    });

    const rows = response.data.values || [];
    const storageMap: Record<string, Mode> = {};

    rows.forEach(([userId, mode]) => {
      if (userId && mode) {
        storageMap[userId] = mode as Mode;
      }
    });

    console.log(`📊 Loaded ${Object.keys(storageMap).length} user modes`);
    return storageMap;
  } catch (error: any) {
    console.error("❌ Error loading storage map:", error.message);
    return {};
  }
}

export async function setUserMode(
  bot: Bot<MyContext>,
  userId: number,
  mode: Mode
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const storageMap = await loadStorageMap();

    if (storageMap[userId.toString()]) {
      // Update existing user
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:A`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === userId.toString());

      if (rowIndex !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!B${rowIndex + 1}:C${rowIndex + 1}`,
          valueInputOption: "RAW",
          requestBody: {
            values: [[mode, timestamp]],
          },
        });
      }
    } else {
      // Add new user
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:C`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[userId.toString(), mode, timestamp]],
        },
      });
    }
    console.log(`💾 Saved mode for user ${userId}`);
  } catch (error: any) {
    console.error("❌ Error saving user mode:", error.message);
    throw error;
  }
}

export async function getUserMode(
  bot: Bot<MyContext>,
  userId: number
): Promise<Mode | null> {
  try {
    // Ensure sheet exists before getting user mode
    await ensureSheetExists();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`,
    });

    const rows = response.data.values || [];
    // Skip header row and find user
    const userRow = rows.slice(1).find((row) => row[0] === userId.toString());

    if (userRow && userRow[1]) {
      console.log(`📱 Found mode for user ${userId}: ${userRow[1]}`);
      return userRow[1] as Mode;
    }

    console.log(`⚠️ No mode found for user ${userId}`);
    return null;
  } catch (error) {
    console.error("❌ Error getting user mode:", error);
    return null;
  }
}

export async function initializeBot(bot: Bot<MyContext>): Promise<void> {
  try {
    console.log("🤖 Initializing storage...");
    // Make sure sheet exists and is accessible
    await ensureSheetExists();

    // Verify we can read data
    const testMap = await loadStorageMap();
    console.log(
      `✅ Storage initialized successfully with ${
        Object.keys(testMap).length
      } users`
    );

    if (Object.keys(testMap).length === 0) {
      console.log("⚠️ Warning: No user modes found in storage");
    }
  } catch (error) {
    console.error("❌ Failed to initialize storage:", error);
    throw error;
  }
}
