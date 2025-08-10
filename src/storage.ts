import { Bot } from "grammy";
import { CHANNEL_ID } from "./config";
import { Mode, MyContext } from "./types";

interface StorageData {
  userId: number;
  mode: Mode;
  timestamp: number;
}

// Save user mode to channel
export async function setUserMode(
  bot: Bot<MyContext>,
  userId: number,
  mode: Mode
) {
  const data: StorageData = {
    userId,
    mode,
    timestamp: Date.now(),
  };

  try {
    await bot.api.sendMessage(CHANNEL_ID, JSON.stringify(data));
  } catch (err) {
    console.error("❌ Failed to save user mode to channel:", err);
    throw err;
  }
}

// Initialize bot by loading previous settings
export async function initializeBot(bot: Bot<MyContext>) {
  try {
    console.log("🤖 Initializing bot...");
    // No need to add message handler here as it's handled in handlers.ts
    return;
  } catch (err) {
    console.error("❌ Failed to initialize bot with storage:", err);
  }
}
