import { ClientApi } from "../client-api";
import {
  UpgradePreviewRequest,
  UpgradePreviewResponse,
  UpgradeCompleteResponse,
  PaymentStatusResponse,
  StripeSetupSessionRequest,
  StripeSetupSessionResponse,
} from "../types/upgrade";

export class UpgradeApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async createUpgradePreview(
    request: UpgradePreviewRequest
  ): Promise<UpgradePreviewResponse> {
    return await this.client.post<UpgradePreviewResponse>(
      "/customer/upgrade/preview",
      request
    );
  }

  async cancelUpgrade(upgradeId: string): Promise<void> {
    return await this.client.delete(`/customer/upgrade/${upgradeId}`);
  }

  async completeUpgrade(
    upgradeId: string
  ): Promise<UpgradeCompleteResponse> {
    return await this.client.post<UpgradeCompleteResponse>(
      `/customer/upgrade/${upgradeId}/complete`,
      {}
    );
  }

  async getPaymentStatus(): Promise<PaymentStatusResponse> {
    return await this.client.get<PaymentStatusResponse>(
      "/customer/upgrade/payment-status"
    );
  }

  async getStripeSetupSession(
    request: StripeSetupSessionRequest
  ): Promise<StripeSetupSessionResponse> {
    return await this.client.post<StripeSetupSessionResponse>(
      "/customer/stripe/setup-session",
      request
    );
  }
}
