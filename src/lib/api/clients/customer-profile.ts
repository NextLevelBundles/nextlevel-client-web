import { ClientApi } from "../client-api";
import { CustomerList, CreateCustomerListRequest } from "../types/customer-profile";

export class CustomerProfileApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getLists(): Promise<CustomerList[]> {
    return await this.client.get<CustomerList[]>("/customer/profile/lists");
  }

  async createList(data: CreateCustomerListRequest): Promise<CustomerList> {
    return await this.client.post<CustomerList>("/customer/profile/lists", data);
  }
}
