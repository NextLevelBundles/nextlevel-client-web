import { ClientApi } from "../client-api";
import type { ExchangeTransactionDto, ExchangeHistoryParams, ExchangeHistoryResponse } from "../types/exchange-history";

export class ExchangeHistoryApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getExchangeHistory(params: ExchangeHistoryParams): Promise<ExchangeHistoryResponse> {
    const queryParams = new URLSearchParams();

    if (params.Type !== undefined) queryParams.append("Type", params.Type.toString());
    if (params.StartDate) queryParams.append("StartDate", params.StartDate);
    if (params.EndDate) queryParams.append("EndDate", params.EndDate);
    if (params.SearchTerm) queryParams.append("SearchTerm", params.SearchTerm);
    if (params.Page !== undefined) queryParams.append("Page", params.Page.toString());
    if (params.PageSize !== undefined) queryParams.append("PageSize", params.PageSize.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/customer/steam-keys/exchange-history?${queryString}`
      : "/customer/steam-keys/exchange-history";

    return await this.client.get<ExchangeHistoryResponse>(endpoint);
  }
}
