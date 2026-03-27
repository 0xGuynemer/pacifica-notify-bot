import axios from "axios";
import { config } from "./config";

const api = axios.create({
  baseURL: config.pacificaBaseUrl,
  timeout: 15000,
});

export type PacificaPosition = {
  symbol: string;
  side?: string;
  size?: number;
  entryPrice?: number;
  markPrice?: number;
  liquidationPrice?: number;
  unrealizedPnl?: number;
  [key: string]: unknown;
};

export type WalletSnapshot = {
  walletAddress: string;
  fetchedAt: string;
  account?: unknown;
  positions: PacificaPosition[];
};

function normalizePositions(payload: unknown): PacificaPosition[] {
  if (Array.isArray(payload)) return payload as PacificaPosition[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.positions)) return obj.positions as PacificaPosition[];
    if (Array.isArray(obj.data)) return obj.data as PacificaPosition[];
  }
  return [];
}

export async function fetchWalletSnapshot(walletAddress: string): Promise<WalletSnapshot> {
  const [accountRes, positionsRes] = await Promise.allSettled([
    api.get("/account", { params: { walletAddress } }),
    api.get("/positions", { params: { walletAddress } }),
  ]);

  const account = accountRes.status === "fulfilled" ? accountRes.value.data : null;
  const positionsData = positionsRes.status === "fulfilled" ? positionsRes.value.data : null;

  return {
    walletAddress,
    fetchedAt: new Date().toISOString(),
    account,
    positions: normalizePositions(positionsData),
  };
}
