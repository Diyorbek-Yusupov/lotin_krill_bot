import { bot } from "./bot";
import { loadData } from "./storage";

// Load stored modes before bot starts
loadData();

bot.start();
console.log("🤖 Bot is running...");
