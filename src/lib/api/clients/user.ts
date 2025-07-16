import { ClientApi } from "../client-appi";
import { Customer, BillingAddress } from "../types/user";
import { Country } from "../types/common";

export class UserApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getCustomer(): Promise<Customer> {
    return await this.client.get<Customer>("/customer");
  }

  async updateBillingAddress(billingAddress: BillingAddress): Promise<void> {
    await this.client.put<void, BillingAddress>(
      "/customer/billing-address",
      billingAddress
    );
  }

  async getCountries(): Promise<Country[]> {
    return await this.client.get<Country[]>("/common/countries");
  }

  async checkHandleAvailability(handle: string): Promise<boolean> {
    return await this.client.get<boolean>(
      `/customer/check-handle?handle=${encodeURIComponent(handle)}`
    );
  }
}
