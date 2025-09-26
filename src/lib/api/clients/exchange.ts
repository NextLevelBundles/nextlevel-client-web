
import { ClientApi } from "../client-api";
import { ExchangeableSteamKeyDto } from "../types/exchange";
import { ExchangeGame } from "../types/exchange-game";

export class ExchangeApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async exchangeSteamKeyForCredits(steamKeyAssignmentId: string): Promise<{ credits: number; success?: boolean }> {
    // Accept both { credits, success } and { credits }
    return await this.client.post<{ credits: number; success?: boolean }, { steamKeyAssignmentId: string }>(
      "/customer/steam-keys/exchange-key-for-credits",
      { steamKeyAssignmentId }
    );
  }

  async exchangeCreditsForSteamKey(steamAppId: number): Promise<{ credits: number; success?: boolean }> {
    // Accept both { credits, success } and { credits }
    return await this.client.post<{ credits: number; success?: boolean }, { steamAppId: number }>(
      "/customer/steam-keys/exchange-credits-for-key",
      { steamAppId }
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

  async getCustomerCredits(): Promise<{ netCredits: number }> {
    // Returns { netCredits, ... } from /customer/steam-keys/credits
    return await this.client.get<{ netCredits: number }>(
      "/customer/steam-keys/credits"
    );
  }

  async getExchangeGameDetails(id: string): Promise<ExchangeGame> {
    return await this.client.get<ExchangeGame>(
      `/customer/exchange/games/${id}`
    );
  }
}
