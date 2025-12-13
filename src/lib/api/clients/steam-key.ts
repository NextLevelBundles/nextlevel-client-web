import { ClientApi } from "../client-api";
import {
  SteamKeyAssignment,
  SteamKeyQueryParams,
  RevealKeyResponse,
  ViewKeyResponse,
  GiftKeyRequest,
  GiftKeyResponse,
  StatusCount,
  SyncSteamLibraryResponse,
  SteamLibraryStatusResponse,
  BundleExchangeInfo,
} from "../types/steam-key";

export class SteamKeyApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getSteamKeys(
    params?: SteamKeyQueryParams
  ): Promise<SteamKeyAssignment[]> {
    const searchParams = new URLSearchParams();

    if (params?.searchQuery) {
      searchParams.append("searchQuery", params.searchQuery);
    }

    if (params?.status) {
      searchParams.append("status", params.status);
    }

    if (params?.giftFilter) {
      searchParams.append("giftFilter", params.giftFilter);
    }

    const endpoint = `/customer/steam-keys${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    return await this.client.get<SteamKeyAssignment[]>(endpoint);
  }

  async revealKey(keyId: string): Promise<RevealKeyResponse> {
    return await this.client.post<RevealKeyResponse>(
      `/customer/steam-keys/${keyId}/reveal`
    );
  }

  async viewKey(keyId: string): Promise<ViewKeyResponse> {
    return await this.client.post<ViewKeyResponse>(
      `/customer/steam-keys/${keyId}/view`
    );
  }

  async giftKey(giftData: GiftKeyRequest): Promise<GiftKeyResponse> {
    return await this.client.post<GiftKeyResponse, GiftKeyRequest>(
      `/customer/gifts/steam-keys/gift`,
      giftData
    );
  }

  async getStatusCounts(): Promise<StatusCount[]> {
    return await this.client.get<StatusCount[]>(
      "/customer/steam-keys/status-counts"
    );
  }

  async syncSteamLibrary(): Promise<SyncSteamLibraryResponse> {
    return await this.client.get<SyncSteamLibraryResponse>(
      "/customer/sync-steam-library"
    );
  }

  async getSteamLibraryStatus(): Promise<SteamLibraryStatusResponse> {
    return await this.client.get<SteamLibraryStatusResponse>(
      "/customer/steam-library-status"
    );
  }

  async getBundleExchangeInfo(assignmentId: string): Promise<BundleExchangeInfo | null> {
    const result = await this.client.get<BundleExchangeInfo>(
      `/customer/steam-keys/${assignmentId}/bundle-exchange-info`
    );

    // API returns empty object for 204 No Content (key not from bundle purchase)
    if (!result || !result.productId) {
      return null;
    }

    return result;
  }
}
