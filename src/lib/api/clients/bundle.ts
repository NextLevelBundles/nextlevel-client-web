import { ClientApi } from "../client-api";
import { BundleBookFormatsResponse, BundleTierAvailabilityResponse, BundleStatisticsResponse, CustomerBundleDto, CharityLeaderboardResponse } from "../types/bundle";

export class BundleApi {
  constructor(private api: ClientApi) {}

  /**
   * Get available book formats for all products in a bundle
   * @param bundleId The bundle ID
   * @returns Bundle book formats or null if not found
   */
  async getBundleBookFormats(bundleId: string): Promise<BundleBookFormatsResponse | null> {
    try {
      const response = await this.api.get<BundleBookFormatsResponse>(
        `/customer/bundles/${bundleId}/book-formats`
      );
      return response;
    } catch (error: any) {
      // Handle 404 gracefully - bundle not found or not available in region
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get tier availability for a bundle in customer's country
   * @param bundleId The bundle ID
   * @returns List of available tiers with key counts
   */
  async getBundleTierAvailability(bundleId: string): Promise<BundleTierAvailabilityResponse> {
    return this.api.get<BundleTierAvailabilityResponse>(
      `/customer/bundles/${bundleId}/tier-availability`
    );
  }

  /**
   * Get customer's purchased bundles for filtering
   * @returns List of bundles the customer has purchased
   */
  async getCustomerBundles(): Promise<CustomerBundleDto[]> {
    return this.api.get<CustomerBundleDto[]>(`/customer/bundles`);
  }

  /**
   * Get customer's purchased bundles from the new endpoint
   * @returns List of purchased bundles with id, title, slug, and type
   */
  async getPurchasedBundles(): Promise<CustomerBundleDto[]> {
    return this.api.get<CustomerBundleDto[]>(`/customer/bundles/purchased/ebooks`);
  }

  /**
   * Get bundle statistics including total raised for charity
   * @param bundleId The bundle ID
   * @returns Bundle statistics or null if request fails
   */
  async getBundleStatistics(bundleId: string): Promise<BundleStatisticsResponse | null> {
    try {
      const response = await this.api.get<BundleStatisticsResponse>(
        `/customer/bundles/${bundleId}/statistics`
      );
      return response;
    } catch (error) {
      // Gracefully handle errors - don't break the page
      console.error("Failed to fetch bundle statistics:", error);
      return null;
    }
  }

  /**
   * Get charity leaderboard for a bundle
   * @param bundleId The bundle ID
   * @param page Page number (default 1)
   * @param pageSize Number of items per page (default 50)
   * @returns Charity leaderboard data
   */
  async getCharityLeaderboard(
    bundleId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<CharityLeaderboardResponse> {
    return this.api.get<CharityLeaderboardResponse>(
      `/customer/bundles/${bundleId}/charity-leaderboard?page=${page}&pageSize=${pageSize}`
    );
  }
}