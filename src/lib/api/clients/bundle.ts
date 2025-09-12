import { ClientApi } from "../client-api";
import { BundleBookFormatsResponse } from "../types/bundle";

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
}