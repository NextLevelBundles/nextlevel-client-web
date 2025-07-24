import { ClientApi } from "./client-api";
import { CartApi } from "./clients/cart";
import { UserApi } from "./clients/user";
import { PurchaseApi } from "./clients/purchase";
import { SteamKeyApi } from "./clients/steam-key";
import { DashboardApi } from "./clients/dashboard";
import { GiftApi } from "./clients/gift";

// Default instance
const apiClient = new ClientApi();

// Create API client instances
export const cartApi = new CartApi(apiClient);
export const userApi = new UserApi(apiClient);
export const purchaseApi = new PurchaseApi(apiClient);
export const steamKeyApi = new SteamKeyApi(apiClient);
export const dashboardApi = new DashboardApi(apiClient);
export const giftApi = new GiftApi(apiClient);
