export declare const db: any;
export type Subscription = {
    id: number;
    chat_id: string;
    wallet_address: string;
    created_at: string;
};
export declare const queries: {
    addSubscription: any;
    removeSubscription: any;
    getSubscriptionsByChat: any;
    getAllWallets: any;
    getSubscriptionsForWallet: any;
    getWalletState: any;
    upsertWalletState: any;
};
//# sourceMappingURL=db.d.ts.map