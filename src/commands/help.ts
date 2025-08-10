import { Context } from "grammy";

export const helpCommand = () => async (ctx: Context) => {
  await ctx.reply(
    "Available commands:\n/start - Start the bot\n/help - Show help"
  );
};
