import { Telegraf } from "telegraf";
import { config } from "./config";
import { queries } from "./db";
import { startMonitor } from "./monitor";

const bot = new Telegraf(config.telegramBotToken);

bot.start(async (ctx) => {
  await ctx.reply(
    [
      "Pacifica Notify Bot is live.",
      "",
      "Commands:",
      "/track <solana_account> - track a Pacifica Solana account",
      "/untrack <solana_account> - stop tracking an account",
      "/list - show tracked accounts",
    ].join("\n")
  );
});

bot.command("track", async (ctx) => {
  const wallet = ctx.message.text.split(/\s+/)[1]?.trim();
  if (!wallet) {
    await ctx.reply("Usage: /track <wallet_address>");
    return;
  }

  queries.addSubscription.run(String(ctx.chat.id), wallet);
  await ctx.reply(`Tracking wallet: ${wallet}`);
});

bot.command("untrack", async (ctx) => {
  const wallet = ctx.message.text.split(/\s+/)[1]?.trim();
  if (!wallet) {
    await ctx.reply("Usage: /untrack <wallet_address>");
    return;
  }

  queries.removeSubscription.run(String(ctx.chat.id), wallet);
  await ctx.reply(`Stopped tracking wallet: ${wallet}`);
});

bot.command("list", async (ctx) => {
  const rows = queries.getSubscriptionsByChat.all(String(ctx.chat.id)) as { wallet_address: string }[];
  if (rows.length === 0) {
    await ctx.reply("You are not tracking any wallets yet.");
    return;
  }

  await ctx.reply(`Tracked wallets:\n${rows.map((r) => `• ${r.wallet_address}`).join("\n")}`);
});

startMonitor(async (chatId, text) => {
  await bot.telegram.sendMessage(chatId, text);
});

bot.launch().then(() => {
  console.log("Pacifica Notify Bot started");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
