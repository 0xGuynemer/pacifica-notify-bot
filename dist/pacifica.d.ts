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
export declare function fetchWalletSnapshot(walletAddress: string): Promise<WalletSnapshot>;
//# sourceMappingURL=pacifica.d.ts.map