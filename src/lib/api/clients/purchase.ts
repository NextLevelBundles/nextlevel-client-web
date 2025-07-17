import { ClientApi } from "../client-api";
import { Purchase, PurchaseQueryParams } from "../types/purchase";

export class PurchaseApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getPurchases(params?: PurchaseQueryParams): Promise<Purchase[]> {
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

    const endpoint = `/customer/purchases${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    return await this.client.get<Purchase[]>(endpoint);
  }
}
