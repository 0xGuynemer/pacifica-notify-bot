import { queries, type Subscription } from "./db";
import { fetchWalletSnapshot, type WalletSnapshot } from "./pacifica";
import { diffSnapshots } from "./alerts";
import { config } from "./config";

export type Notifier = (chatId: string, text: string) => Promise<void>;

export async function runMonitor(notify: Notifier) {
  const wallets = queries.getAllWallets.all() as { wallet_address: string }[];

  for (const { wallet_address } of wallets) {
    try {
      const snapshot = await fetchWalletSnapshot(wallet_address);
      const prevRow = queries.getWalletState.get(wallet_address) as { snapshot_json: string } | undefined;
      const previous = prevRow ? (JSON.parse(prevRow.snapshot_json) as WalletSnapshot) : null;
      const events = diffSnapshots(previous, snapshot);

      if (events.length > 0) {
        const subscriptions = queries.getSubscriptionsForWallet.all(wallet_address) as Subscription[];
        for (const event of events) {
          for (const sub of subscriptions) {
            await notify(sub.chat_id, `${event.message}\nWallet: ${wallet_address}`);
          }
        }
      }

      queries.upsertWalletState.run(wallet_address, JSON.stringify(snapshot));
    } catch (error) {
      console.error(`Monitor error for ${wallet_address}`, error);
    }
  }
}

export function startMonitor(notify: Notifier) {
  runMonitor(notify).catch((error) => console.error("Initial monitor run failed", error));
  setInterval(() => {
    runMonitor(notify).catch((error) => console.error("Monitor tick failed", error));
  }, config.pollIntervalMs);
}
