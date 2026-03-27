import type { WalletSnapshot } from "./pacifica";
export type AlertEvent = {
    walletAddress: string;
    type: "position_opened" | "position_closed" | "size_changed" | "liq_warning";
    message: string;
};
export declare function diffSnapshots(previous: WalletSnapshot | null, current: WalletSnapshot): AlertEvent[];
//# sourceMappingURL=alerts.d.ts.map