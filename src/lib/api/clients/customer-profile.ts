import { ClientApi } from "../client-api";
import {
  CustomerList,
  CustomerListDetail,
  CustomerListItem,
  GameSearchResult,
  CreateCustomerListRequest,
  UpdateCustomerListRequest,
  AddListItemRequest,
  CommunityProfile,
  UpdateCommunityProfileRequest,
  CustomerCollectionGame,
  UnimportedSteamGame,
  ImportGamesRequest,
  UpdateCollectionGameStatusRequest,
  ProfileStats,
  ProfileAchievements,
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

  async getWishlist(): Promise<CustomerListDetail> {
    return await this.client.get<CustomerListDetail>(
      "/customer/profile/wishlist"
    );
  }

  async addToWishlist(data: AddListItemRequest): Promise<CustomerListItem> {
    return await this.client.post<CustomerListItem>(
      "/customer/profile/wishlist/items",
      data
    );
  }

  async removeFromWishlist(itemId: string): Promise<void> {
    await this.client.delete(
      `/customer/profile/wishlist/items/${itemId}`
    );
  }

  async searchGames(query: string): Promise<GameSearchResult[]> {
    return await this.client.get<GameSearchResult[]>(
      `/customer/profile/games/search?q=${encodeURIComponent(query)}`
    );
  }

  async getCommunityProfile(): Promise<CommunityProfile> {
    return await this.client.get<CommunityProfile>(
      "/customer/profile/community"
    );
  }

  async getCommunityProfileByHandle(handle: string): Promise<CommunityProfile | null> {
    try {
      return await this.client.get<CommunityProfile>(
        `/customer/profile/community/${encodeURIComponent(handle)}`
      );
    } catch {
      return null;
    }
  }

  async updateCommunityProfile(
    data: UpdateCommunityProfileRequest
  ): Promise<CommunityProfile> {
    return await this.client.put<CommunityProfile>(
      "/customer/profile/community",
      data
    );
  }

  async getCollection(): Promise<CustomerCollectionGame[]> {
    return await this.client.get<CustomerCollectionGame[]>(
      "/customer/profile/collection"
    );
  }

  async getUnimportedGames(): Promise<UnimportedSteamGame[]> {
    return await this.client.get<UnimportedSteamGame[]>(
      "/customer/profile/collection/unimported"
    );
  }

  async importGames(data: ImportGamesRequest): Promise<CustomerCollectionGame[]> {
    return await this.client.post<CustomerCollectionGame[]>(
      "/customer/profile/collection/import",
      data
    );
  }

  async updateCollectionGameStatus(
    id: string,
    data: UpdateCollectionGameStatusRequest
  ): Promise<void> {
    await this.client.patch(`/customer/profile/collection/${id}/status`, data);
  }

  async removeFromCollection(id: string): Promise<void> {
    await this.client.delete(`/customer/profile/collection/${id}`);
  }

  async getStatsByHandle(handle: string): Promise<ProfileStats | null> {
    try {
      return await this.client.get<ProfileStats>(
        `/customer/profile/stats/${encodeURIComponent(handle)}`
      );
    } catch {
      return null;
    }
  }

  async getAchievementsByHandle(handle: string): Promise<ProfileAchievements | null> {
    try {
      return await this.client.get<ProfileAchievements>(
        `/customer/profile/achievements/${encodeURIComponent(handle)}`
      );
    } catch {
      return null;
    }
  }
}
