import { ClientApi } from "../client-api";
import { Customer, BillingAddress } from "../types/user";
import { Country } from "../types/common";
import { CustomerLocation } from "../types/location";

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

  async getCustomerLocation(): Promise<CustomerLocation> {
    return await this.client.get<CustomerLocation>("/customer/location");
  }

  async updateSteamDetails(steamId: string | null, steamCountry: string | null, steamUsername?: string | null): Promise<Customer> {
    return await this.client.put<Customer, { steamId: string | null; steamCountry: string | null; steamUsername?: string | null }>("/customer/steam-details", {
      steamId,
      steamCountry,
      steamUsername
    });
  }

  async updateCountry(countryCode: string): Promise<Customer> {
    return await this.client.put<Customer, { countryCode: string }>("/customer/country", { countryCode });
  }
}
