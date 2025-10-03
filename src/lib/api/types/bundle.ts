// Bundle Book Formats types
export interface ProductBookFormat {
  productId: string;
  title: string;
  availableFormats: string[];
}

export interface BundleBookFormatsResponse {
  bundleId: string;
  products: ProductBookFormat[];
}

// Customer Bundles types
export interface CustomerBundleDto {
  id: string;
  title: string;
  purchasedAt?: string;
}