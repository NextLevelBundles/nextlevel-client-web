import { ClientApi } from "../client-api";
import { DashboardData } from "../types/dashboard";

export class DashboardApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getDashboardData(): Promise<DashboardData> {
    return await this.client.get<DashboardData>("/customer/dashboard");
  }
}
