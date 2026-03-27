import type { WalletSnapshot, PacificaPosition, PacificaTrade } from "./pacifica";

export type AlertEvent = {
  walletAddress: string;
  type:
    | "position_opened"
    | "position_closed"
    | "size_changed"
    | "liq_warning"
    | "trade_fill"
    | "tp_hit"
    | "sl_hit";
  message: string;
};

function keyForPosition(position: PacificaPosition): string {
  return `${position.symbol}:${position.side || "unknown"}`;
}

function mapPositions(positions: PacificaPosition[]) {
  return new Map(positions.map((p) => [keyForPosition(p), p]));
}

function pctDistance(a: number, b: number): number {
  if (!a || !b) return Infinity;
  return Math.abs(a - b) / Math.abs(b);
}

function tradeKey(trade: PacificaTrade): string {
  return String(trade.history_id);
}

function classifyCloseTrade(trade: PacificaTrade): "tp_hit" | "sl_hit" | null {
  const side = trade.side || "";
  if (!side.startsWith("close_")) return null;
  const pnl = Number(trade.pnl || 0);
  if (pnl > 0) return "tp_hit";
  if (pnl < 0) return "sl_hit";
  return null;
}

export function diffSnapshots(previous: WalletSnapshot | null, current: WalletSnapshot): AlertEvent[] {
  const events: AlertEvent[] = [];
  const prevMap = mapPositions(previous?.positions || []);
  const currMap = mapPositions(current.positions || []);
  const prevTradeIds = new Set((previous?.trades || []).map(tradeKey));

  for (const [key, curr] of currMap.entries()) {
    const prev = prevMap.get(key);
    if (!prev) {
      events.push({
        walletAddress: current.walletAddress,
        type: "position_opened",
        message: `🟢 Position opened on ${curr.symbol} (${curr.side}) amount ${curr.amount}`,
      });
    } else if (Number(prev.amount || 0) !== Number(curr.amount || 0)) {
      events.push({
        walletAddress: current.walletAddress,
        type: "size_changed",
        message: `📐 Position size changed on ${curr.symbol}: ${prev.amount} → ${curr.amount}`,
      });
    }

    const liq = Number(curr.liquidation_price || 0);
    const entry = Number(curr.entry_price || 0);
    if (liq > 0 && entry > 0) {
      const distance = pctDistance(entry, liq);
      if (distance <= 0.1) {
        events.push({
          walletAddress: current.walletAddress,
          type: "liq_warning",
          message: `⚠️ ${curr.symbol} is ${(distance * 100).toFixed(2)}% from liquidation based on entry ${entry} and liq ${liq}`,
        });
      }
    }
  }

  for (const [key, prev] of prevMap.entries()) {
    if (!currMap.has(key)) {
      events.push({
        walletAddress: current.walletAddress,
        type: "position_closed",
        message: `🔴 Position closed on ${prev.symbol} (${prev.side}) amount ${prev.amount}`,
      });
    }
  }

  for (const trade of current.trades) {
    if (prevTradeIds.has(tradeKey(trade))) continue;

    events.push({
      walletAddress: current.walletAddress,
      type: "trade_fill",
      message: `💸 ${trade.side || "trade"} ${trade.symbol} ${trade.amount} @ ${trade.price} | pnl ${trade.pnl || "0"}`,
    });

    const closeType = classifyCloseTrade(trade);
    if (closeType === "tp_hit") {
      events.push({
        walletAddress: current.walletAddress,
        type: "tp_hit",
        message: `🎯 TP-like close detected on ${trade.symbol}. Realized pnl: ${trade.pnl}`,
      });
    } else if (closeType === "sl_hit") {
      events.push({
        walletAddress: current.walletAddress,
        type: "sl_hit",
        message: `🛑 SL-like close detected on ${trade.symbol}. Realized pnl: ${trade.pnl}`,
      });
    }
  }

  return events;
}
