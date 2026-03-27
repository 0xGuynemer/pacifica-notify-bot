import axios from "axios";
import { config } from "./config";

const api = axios.create({
  baseURL: config.pacificaBaseUrl,
  timeout: 15000,
});

export type PacificaAccount = {
  balance?: string;
  account_equity?: string;
  available_to_spend?: string;
  available_to_withdraw?: string;
  total_margin_used?: string;
  cross_mmr?: string;
  positions_count?: number;
  orders_count?: number;
  stop_orders_count?: number;
  updated_at?: number;
  [key: string]: unknown;
};

export type PacificaPosition = {
  symbol: string;
  side: string;
  amount: string;
  entry_price?: string;
  margin?: string;
  funding?: string;
  isolated?: boolean;
  liquidation_price?: string;
  created_at?: number;
  updated_at?: number;
  [key: string]: unknown;
};

export type PacificaTrade = {
  history_id: number;
  order_id?: number;
  symbol: string;
  amount: string;
  price: string;
  entry_price?: string;
  fee?: string;
  pnl?: string;
  event_type?: string;
  side?: string;
  created_at: number;
  cause?: string;
  [key: string]: unknown;
};

export type WalletSnapshot = {
  walletAddress: string;
  fetchedAt: string;
  account: PacificaAccount | null;
  positions: PacificaPosition[];
  trades: PacificaTrade[];
};

async function getData<T>(path: string, account: string): Promise<T> {
  const res = await api.get(path, { params: { account } });
  return res.data.data as T;
}

export async function fetchWalletSnapshot(walletAddress: string): Promise<WalletSnapshot> {
  const [account, positions, trades] = await Promise.all([
    getData<PacificaAccount>("/account", walletAddress).catch(() => null),
    getData<PacificaPosition[]>("/positions", walletAddress).catch(() => []),
    getData<PacificaTrade[]>("/trades/history", walletAddress).catch(() => []),
  ]);

  return {
    walletAddress,
    fetchedAt: new Date().toISOString(),
    account,
    positions,
    trades: trades.slice(0, 25),
  };
}
