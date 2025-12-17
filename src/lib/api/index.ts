import { ClientApi } from "./client-api";
import { CartApi } from "./clients/cart";
import { UserApi } from "./clients/user";
import { PurchaseApi } from "./clients/purchase";
import { SteamKeyApi } from "./clients/steam-key";
import { DashboardApi } from "./clients/dashboard";
import { GiftApi } from "./clients/gift";
import { BookClient } from "./clients/book";
import { CommonClient } from "./clients/common";
import { BundleApi } from "./clients/bundle";
import { ExchangeApi } from "./clients/exchange";

// Export types
export type { TradeInStatus, TradeInValueData } from "./clients/exchange";

// Default instance
const apiClient = new ClientApi();

// Create API client instances
export const cartApi = new CartApi(apiClient);
export const userApi = new UserApi(apiClient);
export const purchaseApi = new PurchaseApi(apiClient);
export const steamKeyApi = new SteamKeyApi(apiClient);
export const dashboardApi = new DashboardApi(apiClient);
export const giftApi = new GiftApi(apiClient);
export const exchangeApi = new ExchangeApi(apiClient);
export const bookApi = new BookClient(apiClient);
export const commonApi = new CommonClient(apiClient);
export const bundleApi = new BundleApi(apiClient);
