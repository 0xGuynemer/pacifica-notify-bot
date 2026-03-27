"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffSnapshots = diffSnapshots;
function keyForPosition(position) {
    return `${position.symbol}:${position.side || "unknown"}`;
}
function mapPositions(positions) {
    return new Map(positions.map((p) => [keyForPosition(p), p]));
}
function pctDistance(a, b) {
    if (!a || !b)
        return Infinity;
    return Math.abs(a - b) / Math.abs(b);
}
function diffSnapshots(previous, current) {
    const events = [];
    const prevMap = mapPositions(previous?.positions || []);
    const currMap = mapPositions(current.positions || []);
    for (const [key, curr] of currMap.entries()) {
        const prev = prevMap.get(key);
        if (!prev) {
            events.push({
                walletAddress: current.walletAddress,
                type: "position_opened",
                message: `🟢 Position opened on ${curr.symbol} (${curr.side || "unknown"})`,
            });
        }
        else if (Number(prev.size || 0) !== Number(curr.size || 0)) {
            events.push({
                walletAddress: current.walletAddress,
                type: "size_changed",
                message: `📐 Position size changed on ${curr.symbol}: ${prev.size || 0} → ${curr.size || 0}`,
            });
        }
        const markPrice = Number(curr.markPrice || 0);
        const liquidationPrice = Number(curr.liquidationPrice || 0);
        if (markPrice > 0 && liquidationPrice > 0) {
            const distance = pctDistance(markPrice, liquidationPrice);
            if (distance <= 0.1) {
                events.push({
                    walletAddress: current.walletAddress,
                    type: "liq_warning",
                    message: `⚠️ ${curr.symbol} is ${(distance * 100).toFixed(2)}% away from liquidation. Mark: ${markPrice}, Liq: ${liquidationPrice}`,
                });
            }
        }
    }
    for (const [key, prev] of prevMap.entries()) {
        if (!currMap.has(key)) {
            events.push({
                walletAddress: current.walletAddress,
                type: "position_closed",
                message: `🔴 Position closed on ${prev.symbol} (${prev.side || "unknown"})`,
            });
        }
    }
    return events;
}
//# sourceMappingURL=alerts.js.map