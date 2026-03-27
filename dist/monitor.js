"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMonitor = runMonitor;
exports.startMonitor = startMonitor;
const db_1 = require("./db");
const pacifica_1 = require("./pacifica");
const alerts_1 = require("./alerts");
const config_1 = require("./config");
async function runMonitor(notify) {
    const wallets = db_1.queries.getAllWallets.all();
    for (const { wallet_address } of wallets) {
        try {
            const snapshot = await (0, pacifica_1.fetchWalletSnapshot)(wallet_address);
            const prevRow = db_1.queries.getWalletState.get(wallet_address);
            const previous = prevRow ? JSON.parse(prevRow.snapshot_json) : null;
            const events = (0, alerts_1.diffSnapshots)(previous, snapshot);
            if (events.length > 0) {
                const subscriptions = db_1.queries.getSubscriptionsForWallet.all(wallet_address);
                for (const event of events) {
                    for (const sub of subscriptions) {
                        await notify(sub.chat_id, `${event.message}\nWallet: ${wallet_address}`);
                    }
                }
            }
            db_1.queries.upsertWalletState.run(wallet_address, JSON.stringify(snapshot));
        }
        catch (error) {
            console.error(`Monitor error for ${wallet_address}`, error);
        }
    }
}
function startMonitor(notify) {
    runMonitor(notify).catch((error) => console.error("Initial monitor run failed", error));
    setInterval(() => {
        runMonitor(notify).catch((error) => console.error("Monitor tick failed", error));
    }, config_1.config.pollIntervalMs);
}
//# sourceMappingURL=monitor.js.map