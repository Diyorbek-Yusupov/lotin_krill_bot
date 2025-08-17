import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { setUserMode, getUserMode } from "./storage";
import { latinToCyrillic, cyrillicToLatin } from "./utils/converter";
import { MyContext, Mode } from "./types";

export function registerHandlers(bot: Bot<MyContext>) {
  // Error handler
  bot.catch((err) => {
    console.error("Error in bot handler:", err);
  });

  // Handle inline queries
  bot.on("inline_query", async (ctx) => {
    const query = ctx.inlineQuery.query;

    if (!query) {
      await ctx.answerInlineQuery([
        {
          type: "article",
          id: "help",
          title: "So'zni kiriting",
          description: "Lotin ↔️ Кирилл o'girish uchun so'z yozing",
          input_message_content: {
            message_text: "Lotin ↔️ Кирилл o'girish uchun so'z yozing",
          },
        },
      ]);
      return;
    }

    const latinResult = cyrillicToLatin(query);
    const cyrillicResult = latinToCyrillic(query);

    const results = [
      {
        type: "article",
        id: "latin",
        title: "Lotin 🔄",
        description: latinResult,
        input_message_content: {
          message_text: latinResult,
        },
      },
      {
        type: "article",
        id: "cyrillic",
        title: "Кирилл 🔄",
        description: cyrillicResult,
        input_message_content: {
          message_text: cyrillicResult,
        },
      },
    ] as const;

    await ctx.answerInlineQuery(results);
  });

  // /start command
  bot.command("start", async (ctx) => {
    try {
      if (!ctx.from) {
        return;
      }

      const existingMode = await getUserMode(bot, ctx.from.id); // Use bot parameter instead of ctx.bot

      if (existingMode) {
        ctx.session.mode = existingMode;
        const modeName =
          existingMode === "LATIN_TO_CYRILLIC"
            ? "Lotin → Kirill"
            : "Kirill → Lotin";
        await ctx.reply(
          `Sizning joriy rejimingiz: ${modeName}\nMatn yuborishingiz mumkin!`,
          {
            reply_markup: new Keyboard()
              .text(
                existingMode === "LATIN_TO_CYRILLIC"
                  ? "Lotincha yozishga o'tish ⇄"
                  : "Kirillcha yozishga o'tish ⇄"
              )
              .resized(),
          }
        );
        return;
      }

      const inlineKeyboard = new InlineKeyboard()
        .text("Lotin → Kirill", "set_lc")
        .text("Kirill → Lotin", "set_cl");

      await ctx.reply("Assalomu alaykum! 👋 Konvertatsiya rejimini tanlang:", {
        reply_markup: inlineKeyboard,
      });
    } catch (error) {
      console.error("Error in start command:", error);
      await ctx.reply("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
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
        if (!ctx.from?.id) {
          await ctx.reply(
            "Kechirasiz, foydalanuvchi ID raqamingizni aniqlay olmadim."
          );
          return;
        }

        // Get current mode from storage if session is empty
        let currentMode = ctx.session.mode;
        if (!currentMode) {
          currentMode = await getUserMode(bot, ctx.from.id);
          if (!currentMode) {
            await ctx.reply(
              "Iltimos, rejimni tanlash uchun /start buyrug'ini yuboring!"
            );
            return;
          }
          ctx.session.mode = currentMode;
        }

        // Toggle mode based on button text
        const newMode =
          ctx.message?.text === "Lotincha yozishga o'tish ⇄"
            ? "CYRILLIC_TO_LATIN" // If user wants Latin, switch to C->L
            : "LATIN_TO_CYRILLIC"; // If user wants Cyrillic, switch to L->C

        await setUserMode(bot, ctx.from.id, newMode);
        ctx.session.mode = newMode;

        // Set keyboard button text based on the new mode
        const replyKeyboard = new Keyboard()
          .text(
            newMode === "LATIN_TO_CYRILLIC"
              ? "Lotincha yozishga o'tish ⇄" // Show Latin option when in L->C mode
              : "Kirillcha yozishga o'tish ⇄" // Show Cyrillic option when in C->L mode
          )
          .resized();

        // Show mode change confirmation
        const modeText =
          newMode === "LATIN_TO_CYRILLIC" ? "Lotin → Kirill" : "Kirill → Lotin";

        await ctx.reply(
          `Rejim o'zgartirildi: ${modeText} ✅\nEndi menga istalgan matnni yuborishingiz mumkin!`,
          { reply_markup: replyKeyboard }
        );
      } catch (error) {
        console.error("Error toggling mode:", error);
        await ctx.reply("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
      }
    }
  );

  // Handle text messages
  bot.on("message:text", async (ctx) => {
    try {
      if (!ctx.from) {
        return;
      }

      // Ignore commands
      if (ctx.message.text.startsWith("/")) return;

      // Get mode from storage if session is empty
      let mode = ctx.session.mode;
      if (!mode) {
        mode = await getUserMode(bot, ctx.from.id); // Use bot parameter instead of ctx.bot
        if (mode) {
          ctx.session.mode = mode;
        }
      }

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
