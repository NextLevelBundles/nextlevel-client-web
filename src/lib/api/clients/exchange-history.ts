import { ClientApi } from "../client-api";
import type { ExchangeTransactionDto, ExchangeHistoryParams, ExchangeHistoryResponse } from "../types/exchange-history";

export class ExchangeHistoryApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getExchangeHistory(params: ExchangeHistoryParams): Promise<ExchangeHistoryResponse> {
    return await this.client.get<ExchangeHistoryResponse>(
      "/customer/steam-keys/exchange-history",
      params
    );
  }
}
