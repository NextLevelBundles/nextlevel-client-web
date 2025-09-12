import { ClientApi } from "../client-api";
import { ExchangeableSteamKeyDto } from "../types/exchange";

export class ExchangeApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async exchangeSteamKeyForCredits(steamKeyId: string): Promise<{ credits: number; success?: boolean }> {
    // Accept both { credits, success } and { credits }
    return await this.client.post<{ credits: number; success?: boolean }, { steamKeyId: string }>(
      "/customer/steam-keys/exchange-key-for-credits",
      { steamKeyId }
    );
  }

  async exchangeCreditsForSteamKey(steamKeyId: string): Promise<{ credits: number; success?: boolean }> {
    // Accept both { credits, success } and { credits }
    return await this.client.post<{ credits: number; success?: boolean }, { steamKeyId: string }>(
      "/customer/steam-keys/exchange-credits-for-key",
      { steamKeyId }
    );
  }

  async getExchangeableSteamKeys(): Promise<ExchangeableSteamKeyDto[]> {
    return await this.client.get<ExchangeableSteamKeyDto[]>(
      "/customer/steam-keys/exchangeable-keys"
    );
  }

   async getToBeExchangeableSteamKeys(): Promise<ExchangeableSteamKeyDto[]> {
    return await this.client.get<ExchangeableSteamKeyDto[]>(
      "/customer/steam-keys/to-be-exchangeable-keys"
    );
  }
}
