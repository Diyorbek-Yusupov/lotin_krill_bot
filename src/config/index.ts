import "dotenv/config";

export const BOT_TOKEN = process.env.BOT_TOKEN || "";
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing in .env");
}

export const CHANNEL_ID = process.env.CHANNEL_ID || "";
if (!CHANNEL_ID) {
  throw new Error("CHANNEL_ID is missing in .env");
}
