"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queries = exports.db = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const config_1 = require("./config");
node_fs_1.default.mkdirSync(node_path_1.default.dirname(config_1.config.databasePath), { recursive: true });
exports.db = new better_sqlite3_1.default(config_1.config.databasePath);
exports.db.pragma("journal_mode = WAL");
exports.db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, wallet_address)
  );

  CREATE TABLE IF NOT EXISTS wallet_state (
    wallet_address TEXT PRIMARY KEY,
    snapshot_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
exports.queries = {
    addSubscription: exports.db.prepare(`INSERT OR IGNORE INTO subscriptions (chat_id, wallet_address) VALUES (?, ?)`),
    removeSubscription: exports.db.prepare(`DELETE FROM subscriptions WHERE chat_id = ? AND wallet_address = ?`),
    getSubscriptionsByChat: exports.db.prepare(`SELECT * FROM subscriptions WHERE chat_id = ? ORDER BY created_at DESC`),
    getAllWallets: exports.db.prepare(`SELECT DISTINCT wallet_address FROM subscriptions ORDER BY wallet_address ASC`),
    getSubscriptionsForWallet: exports.db.prepare(`SELECT * FROM subscriptions WHERE wallet_address = ?`),
    getWalletState: exports.db.prepare(`SELECT snapshot_json FROM wallet_state WHERE wallet_address = ?`),
    upsertWalletState: exports.db.prepare(`INSERT INTO wallet_state (wallet_address, snapshot_json, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(wallet_address)
     DO UPDATE SET snapshot_json = excluded.snapshot_json, updated_at = CURRENT_TIMESTAMP`),
};
//# sourceMappingURL=db.js.map