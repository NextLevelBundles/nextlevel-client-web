import { ClientApi } from "../client-api";
import { PurchaseQueryParams } from "../types/purchase";
import { CartItem } from "../types/cart";

export class PurchaseApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getPurchases(params?: PurchaseQueryParams): Promise<CartItem[]> {
    const searchParams = new URLSearchParams();

    if (params?.sortBy) {
      searchParams.append("sortBy", params.sortBy);
    }

    if (params?.sortDirection) {
      searchParams.append("sortDirection", params.sortDirection);
    }

    if (params?.year) {
      searchParams.append("year", params.year);
    }

    if (params?.searchQuery) {
      searchParams.append("searchQuery", params.searchQuery);
    }

    if (params?.giftFilter) {
      searchParams.append("giftFilter", params.giftFilter);
    }

    const endpoint = `/customer/purchases${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    return await this.client.get<CartItem[]>(endpoint);
  }

  async getRecentPurchases(): Promise<CartItem[]> {
    return await this.client.get<CartItem[]>("/customer/purchases/recent");
  }
}
