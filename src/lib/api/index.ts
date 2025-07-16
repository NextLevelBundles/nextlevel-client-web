import { ClientApi } from "./client-appi";
import { CartApi } from "./clients/cart";
import { UserApi } from "./clients/user";

// Default instance
const apiClient = new ClientApi();

// Create API client instances
export const cartApi = new CartApi(apiClient);
export const userApi = new UserApi(apiClient);
