import { apiClient } from "./client";
import { CartApi } from "./clients/cart";
import { UserApi } from "./clients/user";

// Create API client instances
export const cartApi = new CartApi(apiClient);
export const userApi = new UserApi(apiClient);

// Export the generic client and error types
export { ClientApi, ClientApiError } from "./client";
export type { ApiResponse, ApiError, RequestOptions } from "./client";

// Export all types (backward compatibility)
export * from "./types";

// Export specific type modules for organized imports
export * as CartTypes from "./types/cart";
export * as UserTypes from "./types/user";
export * as CommonTypes from "./types/common";

// Export individual API clients for advanced usage
export { CartApi } from "./clients/cart";
export { UserApi } from "./clients/user";
