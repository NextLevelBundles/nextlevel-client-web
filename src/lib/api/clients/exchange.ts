
import { ClientApi } from "../client-api";
import { ExchangeableSteamKeyDto } from "../types/exchange";

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

  async exchangeCreditsForSteamKey(assignmentId: string): Promise<{ credits: number; success?: boolean }> {
    // Accept both { credits, success } and { credits }
    return await this.client.post<{ credits: number; success?: boolean }, { assignmentId: string }>(
      "/customer/steam-keys/exchange-credits-for-key",
      { assignmentId }
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
}
