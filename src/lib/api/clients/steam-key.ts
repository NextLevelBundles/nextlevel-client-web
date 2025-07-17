import { ClientApi } from "../client-api";
import {
  SteamKey,
  SteamKeyQueryParams,
  RevealKeyResponse,
  ViewKeyResponse,
} from "../types/steam-key";

export class SteamKeyApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getSteamKeys(params?: SteamKeyQueryParams): Promise<SteamKey[]> {
    const searchParams = new URLSearchParams();

    if (params?.searchQuery) {
      searchParams.append("searchQuery", params.searchQuery);
    }

    if (params?.status) {
      searchParams.append("status", params.status);
    }

    const endpoint = `/customer/steam-keys${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    return await this.client.get<SteamKey[]>(endpoint);
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
}
