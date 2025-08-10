import { InlineKeyboard } from "grammy";
import { MyContext } from "./types";
import { convertToLatin, convertToCyrillic } from "./utils/converter";

export async function handleInlineQuery(ctx: MyContext) {
  const query = ctx.inlineQuery?.query;

  if (!query) {
    return await ctx.answerInlineQuery([
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
  }

  const latinResult = convertToLatin(query);
  const cyrillicResult = convertToCyrillic(query);

  const results = [
    {
      type: "article" as const,
      id: "latin",
      title: "Lotin 🔄",
      description: latinResult,
      input_message_content: {
        message_text: latinResult,
      },
      reply_markup: new InlineKeyboard().switchInline("Yana o'girish", ""),
    },
    {
      type: "article" as const,
      id: "cyrillic",
      title: "Кирилл 🔄",
      description: cyrillicResult,
      input_message_content: {
        message_text: cyrillicResult,
      },
      reply_markup: new InlineKeyboard().switchInline("Яна ўгириш", ""),
    },
  ];

  await ctx.answerInlineQuery(results);
}
