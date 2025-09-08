import { ClientApi } from "../client-api";

export class ExchangeApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async exchangeSteamKey(steamKeyId: string): Promise<{ success: boolean; points: number }> {
    return await this.client.post<{ success: boolean; points: number }, { steamKeyId: string }>(
      "/customer/steam-keys/exchange",
      { steamKeyId }
    );
  }
}
