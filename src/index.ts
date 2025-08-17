import { initializeBot } from "./bot";

async function main() {
  try {
    const bot = await initializeBot();
    await bot.start();
  } catch (error) {
    console.error("❌ Error starting bot:", error);
    process.exit(1);
  }
}

main();
