import { getIdTokenFromLocalStorage } from "@/app/(shared)/contexts/id-token/id-token-servie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface CartItem {
  id: string;
  type: "Listing" | "Bundle";
  listingId?: string;
  bundleId?: string;
  bundleTierId?: string;
  quantity: number;
  charityPercentage: number;
  price: number;
  snapshotTitle?: string;
  snapshotImageUrl?: string;
  snapshotPlatform?: string;
  snapshotTierTitle?: string;
  snapshotTierPrice?: number;
  snapshotProducts: {
    productId: string;
    title: string;
    coverImageUrl: string;
    steamGameInfo?: {
      steamAppId?: number;
      packageId: string;
      steamKeyId: string;
    };
  }[];
}

export interface Cart {
  id: string;
  items: CartItem[];
  reservationStatus: "None" | "Active" | "Completed" | "Failed" | "Expired";
  reservedAt?: string;
  reservationExpiresAt?: string;
}

export interface AddToCartRequest {
  bundleId: string;
  tierId: string;
  charityPercentage: number;
  price: number;
}

class ClientApi {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const idToken = getIdTokenFromLocalStorage();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    return headers;
  }

  async getCart(): Promise<Cart> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/customer/cart`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Return empty cart as fallback
      return {
        id: "temp-cart",
        items: [],
        reservationStatus: "None",
      };
    }
  }

  async addToCart(item: AddToCartRequest): Promise<Cart> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/customer/cart/add-bundle`, {
        method: "POST",
        headers,
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/customer/cart/items/${itemId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove from cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/customer/cart/clear`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cart: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }
}

export const apiClient = new ClientApi();
