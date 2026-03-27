export type Notifier = (chatId: string, text: string) => Promise<void>;
export declare function runMonitor(notify: Notifier): Promise<void>;
export declare function startMonitor(notify: Notifier): void;
//# sourceMappingURL=monitor.d.ts.map