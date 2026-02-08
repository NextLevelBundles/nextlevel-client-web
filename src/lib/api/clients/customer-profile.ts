import { ClientApi } from "../client-api";
import {
  CustomerList,
  CustomerListDetail,
  CustomerListItem,
  GameSearchResult,
  CreateCustomerListRequest,
  UpdateCustomerListRequest,
  AddListItemRequest,
} from "../types/customer-profile";

export class CustomerProfileApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getLists(): Promise<CustomerList[]> {
    return await this.client.get<CustomerList[]>("/customer/profile/lists");
  }

  async getListDetail(listId: string): Promise<CustomerListDetail> {
    return await this.client.get<CustomerListDetail>(
      `/customer/profile/lists/${listId}`
    );
  }

  async createList(data: CreateCustomerListRequest): Promise<CustomerList> {
    return await this.client.post<CustomerList>(
      "/customer/profile/lists",
      data
    );
  }

  async updateList(
    listId: string,
    data: UpdateCustomerListRequest
  ): Promise<CustomerList> {
    return await this.client.put<CustomerList>(
      `/customer/profile/lists/${listId}`,
      data
    );
  }

  async deleteList(listId: string): Promise<void> {
    await this.client.delete(`/customer/profile/lists/${listId}`);
  }

  async addItem(
    listId: string,
    data: AddListItemRequest
  ): Promise<CustomerListItem> {
    return await this.client.post<CustomerListItem>(
      `/customer/profile/lists/${listId}/items`,
      data
    );
  }

  async removeItem(listId: string, itemId: string): Promise<void> {
    await this.client.delete(
      `/customer/profile/lists/${listId}/items/${itemId}`
    );
  }

  async searchGames(query: string): Promise<GameSearchResult[]> {
    return await this.client.get<GameSearchResult[]>(
      `/customer/profile/games/search?q=${encodeURIComponent(query)}`
    );
  }
}
