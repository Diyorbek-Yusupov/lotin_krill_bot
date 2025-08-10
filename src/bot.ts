import { Bot } from "grammy";
import { BOT_TOKEN } from "./config";
import { registerHandlers } from "./handlers";

export const bot = new Bot(BOT_TOKEN);

// Register all handlers
registerHandlers(bot);
