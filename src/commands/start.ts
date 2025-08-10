import { Context } from "grammy";

export const startCommand = () => async (ctx: Context) => {
  await ctx.reply("👋 Hello! Welcome to my bot.");
};
