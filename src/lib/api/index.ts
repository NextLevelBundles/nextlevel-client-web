import { ClientApi } from "./client-api";
import { CartApi } from "./clients/cart";
import { UserApi } from "./clients/user";
import { PurchaseApi } from "./clients/purchase";

// Default instance
const apiClient = new ClientApi();

// Create API client instances
export const cartApi = new CartApi(apiClient);
export const userApi = new UserApi(apiClient);
export const purchaseApi = new PurchaseApi(apiClient);
