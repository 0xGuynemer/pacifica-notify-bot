"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const config_1 = require("./config");
const db_1 = require("./db");
const monitor_1 = require("./monitor");
const bot = new telegraf_1.Telegraf(config_1.config.telegramBotToken);
bot.start(async (ctx) => {
    await ctx.reply([
        "Pacifica Notify Bot is live.",
        "",
        "Commands:",
        "/track <wallet> - track a wallet",
        "/untrack <wallet> - stop tracking a wallet",
        "/list - show tracked wallets",
    ].join("\n"));
});
bot.command("track", async (ctx) => {
    const wallet = ctx.message.text.split(/\s+/)[1]?.trim();
    if (!wallet) {
        await ctx.reply("Usage: /track <wallet_address>");
        return;
    }
    db_1.queries.addSubscription.run(String(ctx.chat.id), wallet);
    await ctx.reply(`Tracking wallet: ${wallet}`);
});
bot.command("untrack", async (ctx) => {
    const wallet = ctx.message.text.split(/\s+/)[1]?.trim();
    if (!wallet) {
        await ctx.reply("Usage: /untrack <wallet_address>");
        return;
    }
    db_1.queries.removeSubscription.run(String(ctx.chat.id), wallet);
    await ctx.reply(`Stopped tracking wallet: ${wallet}`);
});
bot.command("list", async (ctx) => {
    const rows = db_1.queries.getSubscriptionsByChat.all(String(ctx.chat.id));
    if (rows.length === 0) {
        await ctx.reply("You are not tracking any wallets yet.");
        return;
    }
    await ctx.reply(`Tracked wallets:\n${rows.map((r) => `• ${r.wallet_address}`).join("\n")}`);
});
(0, monitor_1.startMonitor)(async (chatId, text) => {
    await bot.telegram.sendMessage(chatId, text);
});
bot.launch().then(() => {
    console.log("Pacifica Notify Bot started");
});
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
//# sourceMappingURL=index.js.map