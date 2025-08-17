import { Bot, session } from "grammy";
import { MyContext, Mode } from "./types";
import { BOT_TOKEN } from "./config";
import { registerHandlers } from "./handlers";
import { initializeBot as initializeStorage } from "./storage";

export async function initializeBot() {
  console.log("🤖 Initializing bot...");

  const bot = new Bot<MyContext>(BOT_TOKEN);

  bot.use(
    session({
      initial: () => ({ mode: null as Mode | null }),
    })
  );

  // Initialize storage using the exported function
  await initializeStorage(bot);

  // Register all handlers
  registerHandlers(bot);

  // Error handling
  bot.catch((err) => {
    console.error("❌ Bot error:", err);
  });

  console.log("✅ Bot initialized successfully!");
  return bot;
}
