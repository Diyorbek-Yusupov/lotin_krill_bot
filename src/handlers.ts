import { InlineKeyboard } from "grammy";
import { getUserMode, setUserMode } from "./storage";
import { latinToCyrillic, cyrillicToLatin } from "./utils/converter";
import { Mode } from "./types";

export function registerHandlers(bot: any) {
  // /start command
  bot.command("start", async (ctx: any) => {
    const keyboard = new InlineKeyboard()
      .text("Latin → Cyrillic", "set_lc")
      .text("Cyrillic → Latin", "set_cl");

    await ctx.reply("Choose conversion mode:", { reply_markup: keyboard });
  });

  // Handle mode selection
  bot.callbackQuery("set_lc", async (ctx: any) => {
    setUserMode(ctx.from.id, "LATIN_TO_CYRILLIC");
    await ctx.answerCallbackQuery();
    await ctx.reply("Mode set: Latin → Cyrillic ✅");
  });

  bot.callbackQuery("set_cl", async (ctx: any) => {
    setUserMode(ctx.from.id, "CYRILLIC_TO_LATIN");
    await ctx.answerCallbackQuery();
    await ctx.reply("Mode set: Cyrillic → Latin ✅");
  });

  // Handle text messages
  bot.on("message:text", async (ctx: any) => {
    const mode: Mode = getUserMode(ctx.from.id);

    if (!mode) {
      await ctx.reply("❗ Please choose a mode first using /start");
      return;
    }

    const converted =
      mode === "LATIN_TO_CYRILLIC"
        ? latinToCyrillic(ctx.message.text)
        : cyrillicToLatin(ctx.message.text);

    await ctx.reply(converted);
  });
}
