import { cookies } from "next/headers";
import { Cart } from "./api/types/cart";
import { Bundle } from "@/app/(shared)/types/bundle";

const API_BASE_URL = process.env.API_URL ?? "";

class ServerApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies();
    const idToken = cookieStore.get("id_token")?.value;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    return headers;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 2
  ): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        // Check if response is ok or if it's a known error we shouldn't retry
        if (
          response.ok ||
          response.status === 401 ||
          response.status === 403 ||
          response.status === 404
        ) {
          return response;
        }

        // If server error and we have retries left, wait and retry
        if (response.status >= 500 && i < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          continue;
        }

        return response;
      } catch (error) {
        // Network error or timeout
        if (i === retries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    throw new Error("Max retries reached");
  }

  async getCart(): Promise<Cart> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithRetry(
        `${API_BASE_URL}/customer/cart`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text) {
        // Empty response, return default cart
        return {
          id: "temp-cart",
          items: [],
          reservationStatus: "None",
          total: 0,
        };
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse cart response:", text);
        throw new Error("Invalid JSON response from server");
      }
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

  async getBundles(): Promise<Bundle[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithRetry(
        `${API_BASE_URL}/customer/bundles`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      // Check response status
      if (!response.ok) {
        console.error(
          `Failed to fetch bundles: ${response.status} ${response.statusText}`
        );
        return [];
      }

      // Read response as text first to handle empty responses
      const text = await response.text();
      if (!text || text.trim() === "") {
        console.warn("Empty response from bundles API");
        return [];
      }

      // Try to parse JSON
      try {
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
      } catch (parseError) {
        console.error(
          "Failed to parse bundles response:",
          text.substring(0, 100)
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching bundles:", error);
      // Return empty array as fallback
      return [];
    }
  }
}

export const serverApiClient = new ServerApiClient();
