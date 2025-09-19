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

  async getGiftableKeys(): Promise<SteamKeyAssignment[]> {
    return await this.client.get<SteamKeyAssignment[]>(
      "/customer/steam-keys/giftable"
    );
  }

  async giftKey(giftData: GiftKeyRequest): Promise<GiftKeyResponse> {
    return await this.client.post<GiftKeyResponse, GiftKeyRequest>(
      `/customer/steam-key-gifts/gift`,
      giftData
    );
  }

  async getStatusCounts(): Promise<StatusCount[]> {
    return await this.client.get<StatusCount[]>(
      "/customer/steam-keys/status-counts"
    );
  }

  async syncSteamLibrary(): Promise<SyncSteamLibraryResponse> {
    return await this.client.get<SyncSteamLibraryResponse>("/customer/sync-steam-library");
  }
}
