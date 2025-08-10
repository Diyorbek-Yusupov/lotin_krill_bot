import { Bot } from "grammy";
import { CHANNEL_ID, MAP_MESSAGE_ID } from "./config";
import { Mode, MyContext } from "./types";

interface UserStorage {
  mode: Mode;
  timestamp: number;
}

interface StorageMap {
  [userId: string]: number;
}

let userStorageMap: StorageMap = {};

// Load the storage map from channel
async function loadStorageMap(bot: Bot<MyContext>) {
  try {
    // Get the map message from forwarding it
    const msg = await bot.api.forwardMessage(
      CHANNEL_ID,
      CHANNEL_ID,
      MAP_MESSAGE_ID
    );

    if (msg.text) {
      try {
        const parsedMap = JSON.parse(msg.text);
        // Convert any object message IDs to numbers
        userStorageMap = Object.fromEntries(
          Object.entries(parsedMap).map(([userId, value]) => [
            userId,
            typeof value === 'object' ? (value as any).messageId : value
          ])
        );
        console.log("📝 Loaded storage map successfully");
      } catch (parseError) {
        console.error("❌ Error parsing storage map:", parseError);
        userStorageMap = {};
      }
    }

    // Delete the forwarded message
    await bot.api.deleteMessage(CHANNEL_ID, msg.message_id);
  } catch (err) {
    console.error("❌ Error loading storage map:", err);
    userStorageMap = {};
  }
}

// Save the storage map to channel
async function saveStorageMap(bot: Bot<MyContext>) {
  try {
    await bot.api.editMessageText(
      CHANNEL_ID,
      MAP_MESSAGE_ID,
      JSON.stringify(userStorageMap)
    );
    console.log("💾 Saved storage map successfully");
  } catch (err) {
    console.error("❌ Error saving storage map:", err);
    throw err;
  }
}

// Update user's mode in the channel
export async function setUserMode(
  bot: Bot<MyContext>,
  userId: number,
  mode: Mode
) {
  try {
    const userIdStr = userId.toString();
    if (userStorageMap[userIdStr]) {
      // Update existing message
      const messageId = userStorageMap[userIdStr];
      const data: UserStorage = {
        mode,
        timestamp: Date.now(),
      };

      await bot.api.editMessageText(
        CHANNEL_ID,
        messageId,
        JSON.stringify(data)
      );
    } else {
      // Create new message for user
      const data: UserStorage = {
        mode,
        timestamp: Date.now(),
      };

      const msg = await bot.api.sendMessage(CHANNEL_ID, JSON.stringify(data));

      // Add to storage map
      userStorageMap[userIdStr] = msg.message_id;
      
      // Only save map when adding new user
      await saveStorageMap(bot);
    }
  } catch (err) {
    console.error("❌ Failed to save user mode:", err);
    throw err;
  }
}

// Get user's mode from storage
export async function getUserMode(
  bot: Bot<MyContext>,
  userId: number
): Promise<Mode | null> {
  try {
    const userIdStr = userId.toString();
    let messageId = userStorageMap[userIdStr];
    
    // Handle case where messageId might be an object
    if (typeof messageId === 'object' && messageId !== null) {
      messageId = (messageId as any).messageId;
    }
    
    if (!messageId) {
      return null;
    }

    try {
      // Get the actual message to verify mode
      const msg = await bot.api.forwardMessage(
        CHANNEL_ID,
        CHANNEL_ID,
        messageId
      );

      if (msg.text) {
        const data = JSON.parse(msg.text) as UserStorage;
        // Delete the forwarded message after reading
        await bot.api.deleteMessage(CHANNEL_ID, msg.message_id);
        return data.mode;
      }
    } catch (err) {
      console.error("❌ Error reading user mode message:", err);
    }

    return null;
  } catch (err) {
    console.error("❌ Failed to get user mode:", err);
    return null;
  }
}

// Initialize bot storage
export async function initializeBot(bot: Bot<MyContext>) {
  try {
    console.log("🤖 Initializing bot storage...");
    await loadStorageMap(bot);
    console.log("✅ Bot storage initialized with map message:", MAP_MESSAGE_ID);
  } catch (err) {
    console.error("❌ Failed to initialize bot storage:", err);
    throw err;
  }
}
