
import { ClientApi } from "../client-api";
import { ExchangeGame, ExchangeGameDetails } from "../types/exchange-game";

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

  async getCustomerCredits(): Promise<{ netCredits: number }> {
    // Returns { netCredits, ... } from /customer/steam-keys/credits
    return await this.client.get<{ netCredits: number }>(
      "/customer/steam-keys/credits"
    );
  }

  async getExchangeGameDetails(id: string): Promise<ExchangeGameDetails> {
    return await this.client.get<ExchangeGameDetails>(
      `/customer/exchange/games/${id}`
    );
  }

  async getExchangeGames(): Promise<ExchangeGame[]> {
    return await this.client.get<ExchangeGame[]>(
      `/customer/exchange/games`
    );
  }
}
