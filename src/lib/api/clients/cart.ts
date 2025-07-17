import { ClientApi } from "../client-api";
import { Cart, AddToCartRequest } from "../types/cart";

export class CartApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getCart(): Promise<Cart> {
    try {
      return await this.client.get<Cart>("/customer/cart");
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
    return await this.client.post<Cart, AddToCartRequest>(
      "/customer/cart/add-bundle",
      item
    );
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    return await this.client.delete<Cart>(`/customer/cart/items/${itemId}`);
  }

  async clearCart(): Promise<void> {
    await this.client.put<void>("/customer/cart/clear");
  }

  async reserveCart(): Promise<{ url: string }> {
    return await this.client.post<{ url: string }>(
      "/customer/checkout/reserve"
    );
  }
}
