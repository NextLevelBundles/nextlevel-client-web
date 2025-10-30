import { ClientApi } from "../client-api";
import { BundleBookFormatsResponse, BundleTierAvailabilityResponse, CustomerBundleDto } from "../types/bundle";

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
}