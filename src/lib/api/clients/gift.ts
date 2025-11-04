import { ClientApi } from "../client-api";
import { CartItemGift, SteamKeyGift, AcceptGiftResponse } from "../types/gift";

export class GiftApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getCartItemGift(cartItemId: string): Promise<CartItemGift> {
    return await this.client.get<CartItemGift>(
      `/gifts/cart-items/${cartItemId}`
    );
  }

  async acceptCartItemGift(
    cartItemId: string,
    email: string
  ): Promise<AcceptGiftResponse> {
    const params = new URLSearchParams({ email });
    return await this.client.post<AcceptGiftResponse>(
      `/gifts/cart-items/${cartItemId}/accept?${params.toString()}`
    );
  }

  async getSteamKeyGift(
    assignmentId: string,
    email: string
  ): Promise<SteamKeyGift> {
    const params = email ? new URLSearchParams({ email }) : new URLSearchParams();
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await this.client.get<SteamKeyGift>(
      `/gifts/steam-keys/${assignmentId}${queryString}`
    );
  }

  async acceptSteamKeyGift(
    assignmentId: string,
    email: string
  ): Promise<AcceptGiftResponse> {
    const params = new URLSearchParams({ email });
    return await this.client.post<AcceptGiftResponse>(
      `/gifts/steam-keys/${assignmentId}/accept?${params.toString()}`
    );
  }

  async resendPurchaseGiftEmail(
    cartItemId: string
  ): Promise<{ message: string }> {
    return await this.client.post<{ message: string }>(
      `/customer/gift-management/purchase-gifts/${cartItemId}/resend-email`
    );
  }

  async resendSteamKeyGiftEmail(
    assignmentId: string
  ): Promise<{ message: string }> {
    return await this.client.post<{ message: string }>(
      `/customer/gift-management/steam-key-gifts/${assignmentId}/resend-email`
    );
  }
}
