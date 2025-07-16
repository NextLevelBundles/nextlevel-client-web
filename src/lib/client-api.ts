// This file is deprecated. Use the new API architecture in /lib/api/
// Import the new API clients instead:
// import { cartApi, userApi } from "@/lib/api";

import { cartApi } from "./api";

// Re-export for backward compatibility
export const apiClient = cartApi;

// Re-export types for backward compatibility
export type { CartItem, Cart, AddToCartRequest } from "./api/types";
