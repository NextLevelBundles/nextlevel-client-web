import { auth } from "@/auth";
import { Cart } from "./api/types/cart";

const API_BASE_URL = process.env.API_URL ?? "";

class ServerApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await auth();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (session?.id_token) {
      headers["Authorization"] = `Bearer ${session.id_token}`;
    }

    return headers;
  }

  async getCart(): Promise<Cart> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/customer/cart`, {
        method: "GET",
        headers,
        cache: "no-store",
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
        total: 0,
      };
    }
  }
}

export const serverApiClient = new ServerApiClient();
