import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "./config";

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new Database(config.databasePath);

db.pragma("journal_mode = WAL");

db.exec(`
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

export type Subscription = {
  id: number;
  chat_id: string;
  wallet_address: string;
  created_at: string;
};

export const queries = {
  addSubscription: db.prepare(
    `INSERT OR IGNORE INTO subscriptions (chat_id, wallet_address) VALUES (?, ?)`
  ),
  removeSubscription: db.prepare(
    `DELETE FROM subscriptions WHERE chat_id = ? AND wallet_address = ?`
  ),
  getSubscriptionsByChat: db.prepare(
    `SELECT * FROM subscriptions WHERE chat_id = ? ORDER BY created_at DESC`
  ),
  getAllWallets: db.prepare(
    `SELECT DISTINCT wallet_address FROM subscriptions ORDER BY wallet_address ASC`
  ),
  getSubscriptionsForWallet: db.prepare(
    `SELECT * FROM subscriptions WHERE wallet_address = ?`
  ),
  getWalletState: db.prepare(
    `SELECT snapshot_json FROM wallet_state WHERE wallet_address = ?`
  ),
  upsertWalletState: db.prepare(
    `INSERT INTO wallet_state (wallet_address, snapshot_json, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(wallet_address)
     DO UPDATE SET snapshot_json = excluded.snapshot_json, updated_at = CURRENT_TIMESTAMP`
  ),
};
