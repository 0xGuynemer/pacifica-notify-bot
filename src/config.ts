import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  pacificaBaseUrl: process.env.PACIFICA_BASE_URL || "https://api.pacifica.fi/api/v1",
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 15000),
  databasePath: process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bot.db"),
};

if (!config.telegramBotToken) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}
