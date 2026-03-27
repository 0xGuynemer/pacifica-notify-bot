"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWalletSnapshot = fetchWalletSnapshot;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const api = axios_1.default.create({
    baseURL: config_1.config.pacificaBaseUrl,
    timeout: 15000,
});
function normalizePositions(payload) {
    if (Array.isArray(payload))
        return payload;
    if (payload && typeof payload === "object") {
        const obj = payload;
        if (Array.isArray(obj.positions))
            return obj.positions;
        if (Array.isArray(obj.data))
            return obj.data;
    }
    return [];
}
async function fetchWalletSnapshot(walletAddress) {
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
//# sourceMappingURL=pacifica.js.map