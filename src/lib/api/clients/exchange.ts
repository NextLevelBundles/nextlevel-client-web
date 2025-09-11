import { ClientApi } from "../client-api";
import { ExchangeableSteamKeyDto } from "../types/exchange";

export class ExchangeApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async exchangeSteamKeyForCredits(steamKeyId: string): Promise<{ success: boolean; credits: number }> {
    return await this.client.post<{ success: boolean; credits: number }, { steamKeyId: string }>(
      "/customer/steam-keys/exchange-key-for-credits",
      { steamKeyId }
    );
  }

  async exchangeCreditsForSteamKey(steamKeyId: string): Promise<{ success: boolean; credits: number }> {
    return await this.client.post<{ success: boolean; credits: number }, { steamKeyId: string }>(
      "/customer/steam-keys/exchange-credits-for-key",
      { steamKeyId }
    );
  }

  async getExchangeableSteamKeys(): Promise<ExchangeableSteamKeyDto[]> {
    return await this.client.get<ExchangeableSteamKeyDto[]>(
      "/customer/steam-keys/exchangeable-keys"
    );
  }
}
