import { ClientApi } from "../client-api";
import { CartItemGift, AcceptGiftResponse } from "../types/gift";
import { SteamKeyAssignment } from "../types/steam-key";

export class GiftApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  // CartItem Gifts
  // Anonoumous request
  async getCartItemGift(cartItemId: string): Promise<CartItemGift> {
    return await this.client.get<CartItemGift>(
      `/customer/gifts/cart-items/${cartItemId}`
    );
  }

  async acceptCartItemGift(cartItemId: string): Promise<AcceptGiftResponse> {
    return await this.client.post<AcceptGiftResponse>(
      `/customer/gifts/cart-items/${cartItemId}/accept`
    );
  }

  async resendCartItemGiftEmail(
    cartItemId: string
  ): Promise<{ message: string }> {
    return await this.client.post<{ message: string }>(
      `/customer/gifts/cart-items/${cartItemId}/resend-email`
    );
  }

  // Steam Key Gifts
  // Anonoumous request
  async getSteamKeyGift(assignmentId: string): Promise<SteamKeyAssignment> {
    return await this.client.get<SteamKeyAssignment>(
      `/customer/gifts/steam-keys/${assignmentId}`
    );
  }

  async acceptSteamKeyGift(assignmentId: string): Promise<AcceptGiftResponse> {
    return await this.client.post<AcceptGiftResponse>(
      `/customer/gifts/steam-keys/${assignmentId}/accept`
    );
  }

  async resendSteamKeyGiftEmail(
    assignmentId: string
  ): Promise<{ message: string }> {
    return await this.client.post<{ message: string }>(
      `/customer/gifts/steam-keys/${assignmentId}/resend-email`
    );
  }
}
