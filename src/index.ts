import { createBot } from "./bot";

async function main() {
  try {
    const bot = await createBot();
    await bot.start();
  } catch (error) {
    console.error("❌ Error starting bot:", error);
    process.exit(1);
  }
}

main();
