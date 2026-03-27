"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
    pacificaBaseUrl: process.env.PACIFICA_BASE_URL || "https://api.pacifica.fi/api/v1",
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 15000),
    databasePath: process.env.DATABASE_PATH || node_path_1.default.join(process.cwd(), "data", "bot.db"),
};
if (!exports.config.telegramBotToken) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
}
//# sourceMappingURL=config.js.map