import { ClientApi } from "../client-api";
import {
  CustomerList,
  CustomerListDetail,
  CustomerListItem,
  GameSearchResult,
  CreateCustomerListRequest,
  UpdateCustomerListRequest,
  AddListItemRequest,
  CustomerProfile,
  UpdateCustomerProfileRequest,
  CustomerGame,
  UnimportedSteamGame,
  PaginatedResponse,
  ImportGamesRequest,
  UpdateCollectionGameStatusRequest,
  SetGamesRemovedRequest,
  ProfileStats,
  ProfileAchievements,
  CuratorProfile,
} from "../types/customer-profile";

export class CustomerProfileApi {
  private client: ClientApi;

  constructor(client: ClientApi) {
    this.client = client;
  }

  async getLists(): Promise<CustomerList[]> {
    return await this.client.get<CustomerList[]>("/community/lists");
  }

  async getListDetail(listId: string): Promise<CustomerListDetail> {
    return await this.client.get<CustomerListDetail>(
      `/community/lists/${listId}`
    );
  }

  async createList(data: CreateCustomerListRequest): Promise<CustomerList> {
    return await this.client.post<CustomerList>(
      "/community/lists",
      data
    );
  }

  async updateList(
    listId: string,
    data: UpdateCustomerListRequest
  ): Promise<CustomerList> {
    return await this.client.put<CustomerList>(
      `/community/lists/${listId}`,
      data
    );
  }

  async deleteList(listId: string): Promise<void> {
    await this.client.delete(`/community/lists/${listId}`);
  }

  async addItem(
    listId: string,
    data: AddListItemRequest
  ): Promise<CustomerListItem> {
    return await this.client.post<CustomerListItem>(
      `/community/lists/${listId}/items`,
      data
    );
  }

  async removeItem(listId: string, itemId: string): Promise<void> {
    await this.client.delete(
      `/community/lists/${listId}/items/${itemId}`
    );
  }

  async getWishlist(): Promise<CustomerListDetail> {
    return await this.client.get<CustomerListDetail>(
      "/community/wishlist"
    );
  }

  async addToWishlist(data: AddListItemRequest): Promise<CustomerListItem> {
    return await this.client.post<CustomerListItem>(
      "/community/wishlist/items",
      data
    );
  }

  async removeFromWishlist(itemId: string): Promise<void> {
    await this.client.delete(
      `/community/wishlist/items/${itemId}`
    );
  }

  async searchGames(query: string): Promise<GameSearchResult[]> {
    return await this.client.get<GameSearchResult[]>(
      `/community/games/search?q=${encodeURIComponent(query)}`
    );
  }

  async getCustomerProfile(): Promise<CustomerProfile> {
    return await this.client.get<CustomerProfile>(
      "/community/profile"
    );
  }

  async getCustomerProfileByHandle(handle: string): Promise<CustomerProfile | null> {
    try {
      return await this.client.get<CustomerProfile>(
        `/community/profile/${encodeURIComponent(handle)}`
      );
    } catch {
      return null;
    }
  }

  async updateCustomerProfile(
    data: UpdateCustomerProfileRequest
  ): Promise<CustomerProfile> {
    return await this.client.put<CustomerProfile>(
      "/community/profile",
      data
    );
  }

  async getCollection(): Promise<CustomerGame[]> {
    return await this.client.get<CustomerGame[]>(
      "/community/collection"
    );
  }

  async getUnimportedGames(params?: {
    search?: string;
    playtimeFilter?: string;
    page?: number;
    pageSize?: number;
    isRemoved?: boolean;
  }): Promise<PaginatedResponse<UnimportedSteamGame>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.playtimeFilter) searchParams.set("playtimeFilter", params.playtimeFilter);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.isRemoved !== undefined) searchParams.set("isRemoved", params.isRemoved.toString());
    const qs = searchParams.toString();
    return await this.client.get<PaginatedResponse<UnimportedSteamGame>>(
      `/community/collection/unimported${qs ? `?${qs}` : ""}`
    );
  }

  async setGamesRemoved(data: SetGamesRemovedRequest): Promise<void> {
    await this.client.patch("/community/collection/unimported/set-removed", data);
  }

  async importGames(data: ImportGamesRequest): Promise<CustomerGame[]> {
    return await this.client.post<CustomerGame[]>(
      "/community/collection/import",
      data
    );
  }

  async updateCollectionGameStatus(
    id: string,
    data: UpdateCollectionGameStatusRequest
  ): Promise<void> {
    await this.client.patch(`/community/collection/${id}/status`, data);
  }

  async removeFromCollection(id: string): Promise<void> {
    await this.client.delete(`/community/collection/${id}`);
  }

  async getStatsByHandle(handle: string): Promise<ProfileStats | null> {
    try {
      return await this.client.get<ProfileStats>(
        `/community/stats/${encodeURIComponent(handle)}`
      );
    } catch {
      return null;
    }
  }

  async getAchievementsByHandle(handle: string): Promise<ProfileAchievements | null> {
    try {
      return await this.client.get<ProfileAchievements>(
        `/community/achievements/${encodeURIComponent(handle)}`
      );
    } catch {
      return null;
    }
  }

  async getCuratorProfile(handle: string): Promise<CuratorProfile | null> {
    try {
      return await this.client.get<CuratorProfile>(
        `/community/curator/${encodeURIComponent(handle)}`
      );
    } catch {
      return null;
    }
  }
}
