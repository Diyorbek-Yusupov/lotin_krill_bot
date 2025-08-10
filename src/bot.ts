import { Bot, session } from "grammy";
import { BOT_TOKEN } from "./config";
import { registerHandlers } from "./handlers";
import { initializeBot } from "./storage";
import { MyContext, SessionData } from "./types";

function initialSession(): SessionData {
  return { mode: null };
}

export async function createBot() {
  const bot = new Bot<MyContext>(BOT_TOKEN);
  
  // Set up session middleware
  bot.use(session({ initial: initialSession }));

  // Initialize bot with channel storage
  await initializeBot(bot);

  // Register all handlers
  registerHandlers(bot);

  // Add error handler
  bot.catch((err) => {
    console.error("Error in bot:", err);
  });

  return bot;
}
