import { apiClient } from "./client";
import { CartApi } from "./clients/cart";
import { UserApi } from "./clients/user";

// Create API client instances
export const cartApi = new CartApi(apiClient);
export const userApi = new UserApi(apiClient);

// Export the generic client and error types
export { ClientApi, ClientApiError } from "./client";
export type { ApiResponse, ApiError, RequestOptions } from "./client";

// Export all types
export * from "./types";

// Export individual API clients for advanced usage
export { CartApi } from "./clients/cart";
export { UserApi } from "./clients/user";
