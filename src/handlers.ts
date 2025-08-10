import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { setUserMode, getUserMode } from "./storage";
import { latinToCyrillic, cyrillicToLatin } from "./utils/converter";
import { MyContext } from "./types";

export function registerHandlers(bot: Bot<MyContext>) {
  // Error handler
  bot.catch((err) => {
    console.error("Error in bot handler:", err);
  });

  // /start command
  bot.command("start", async (ctx) => {
    try {
      if (!ctx.from?.id) {
        await ctx.reply("Kechirasiz, foydalanuvchi ID raqamingizni aniqlay olmadim.");
        return;
      }

      // Check existing mode
      const existingMode = await getUserMode(bot, ctx.from.id);
      ctx.session.mode = existingMode;  // Sync session with storage

      const inlineKeyboard = new InlineKeyboard()
        .text("Lotin → Kirill", "set_lc")
        .text("Kirill → Lotin", "set_cl");

      // Include a welcome message for new users
      const welcomeMsg = existingMode
        ? "Yangi rejimni tanlang:"
        : "Assalomu alaykum! 👋 Konvertatsiya rejimini tanlang:";

      await ctx.reply(welcomeMsg, { reply_markup: inlineKeyboard });
    } catch (error) {
      console.error("Error in start command:", error);
      await ctx.reply("Sorry, there was an error. Please try again.");
    }
  });

  // Mode command to show current mode and switch options
  bot.command("mode", async (ctx) => {
    try {
      const inlineKeyboard = new InlineKeyboard()
        .text("Lotin → Kirill", "set_lc")
        .text("Kirill → Lotin", "set_cl");

      const currentMode = ctx.session.mode;
      const modeText =
        currentMode === "LATIN_TO_CYRILLIC"
          ? "Lotin → Kirill"
          : currentMode === "CYRILLIC_TO_LATIN"
          ? "Kirill → Lotin"
          : "Tanlanmagan";

      await ctx.reply(`Joriy rejim: ${modeText}\nO'zgartirish uchun tanlang:`, {
        reply_markup: inlineKeyboard,
      });
    } catch (error) {
      console.error("Error in mode command:", error);
      await ctx.reply("Sorry, there was an error. Please try again.");
    }
  });

  // Handle mode selection
  bot.callbackQuery("set_lc", async (ctx) => {
    try {
      await setUserMode(bot, ctx.from.id, "LATIN_TO_CYRILLIC");
      ctx.session.mode = "LATIN_TO_CYRILLIC";
      await ctx.answerCallbackQuery();

      // Set up the persistent keyboard with toggle button
      const replyKeyboard = new Keyboard()
        .text("Lotincha yozishga o'tish ⇄")
        .resized();

      await ctx.reply(
        "Lotin → Kirill rejimi tanlandi ✅\nEndi menga istalgan matnni yuborishingiz mumkin!",
        { reply_markup: replyKeyboard }
      );
    } catch (error) {
      console.error("Error setting Latin to Cyrillic mode:", error);
      await ctx.answerCallbackQuery({
        text: "Error setting mode. Please try again.",
      });
    }
  });

  bot.callbackQuery("set_cl", async (ctx) => {
    try {
      await setUserMode(bot, ctx.from.id, "CYRILLIC_TO_LATIN");
      ctx.session.mode = "CYRILLIC_TO_LATIN";
      await ctx.answerCallbackQuery();

      // Set up the persistent keyboard with toggle button
      const replyKeyboard = new Keyboard()
        .text("Kirillcha yozishga o'tish ⇄")
        .resized();

      await ctx.reply(
        "Kirill → Lotin rejimi tanlandi ✅\nEndi menga istalgan matnni yuborishingiz mumkin!",
        { reply_markup: replyKeyboard }
      );
    } catch (error) {
      console.error("Error setting Cyrillic to Latin mode:", error);
      await ctx.answerCallbackQuery({
        text: "Error setting mode. Please try again.",
      });
    }
  });

  // Handle mode toggle from keyboard buttons
  bot.hears(
    ["Lotincha yozishga o'tish ⇄", "Kirillcha yozishga o'tish ⇄"],
    async (ctx) => {
      try {
        const currentMode = ctx.session.mode;

        if (!currentMode) {
          await ctx.reply(
            "Iltimos, rejimni tanlash uchun /start buyrug'ini yuboring!"
          );
          return;
        }

        // Toggle the mode
        if (!ctx.from?.id) {
          await ctx.reply(
            "Kechirasiz, foydalanuvchi ID raqamingizni aniqlay olmadim."
          );
          return;
        }

        const newMode =
          currentMode === "LATIN_TO_CYRILLIC"
            ? "CYRILLIC_TO_LATIN"
            : "LATIN_TO_CYRILLIC";
        await setUserMode(bot, ctx.from.id, newMode);
        ctx.session.mode = newMode;

        // Show mode change confirmation
        const modeText =
          newMode === "LATIN_TO_CYRILLIC" ? "Lotin → Kirill" : "Kirill → Lotin";

        // Set keyboard button text based on the new mode
        const replyKeyboard = new Keyboard()
          .text(
            newMode === "LATIN_TO_CYRILLIC"
              ? "Lotincha yozishga o'tish ⇄"
              : "Kirillcha yozishga o'tish ⇄"
          )
          .resized();

        await ctx.reply(
          `Rejim o'zgartirildi: ${modeText} ✅\nEndi menga istalgan matnni yuborishingiz mumkin!`,
          { reply_markup: replyKeyboard }
        );
      } catch (error) {
        console.error("Error toggling mode:", error);
        await ctx.reply("Error changing mode. Please try again.");
      }
    }
  );

  // Handle text messages
  bot.on("message:text", async (ctx) => {
    try {
      // Ignore /start and /mode commands
      if (ctx.message.text.startsWith("/")) return;

      const mode = ctx.session.mode;

      if (!mode) {
        const keyboard = new InlineKeyboard()
          .text("Lotin → Kirill", "set_lc")
          .text("Kirill → Lotin", "set_cl");

        await ctx.reply("Iltimos, avval konvertatsiya rejimini tanlang:", {
          reply_markup: keyboard,
        });
        return;
      }

      const converted =
        mode === "LATIN_TO_CYRILLIC"
          ? latinToCyrillic(ctx.message.text)
          : cyrillicToLatin(ctx.message.text);

      await ctx.reply(converted);
    } catch (error) {
      console.error("Error handling text message:", error);
      await ctx.reply(
        "Kechirasiz, matningizni konvertatsiya qilishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
      );
    }
  });
}
