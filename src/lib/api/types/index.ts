// Cart related types
export interface CartItem {
  id: string;
  type: "Listing" | "Bundle";
  listingId?: string;
  bundleId?: string;
  bundleTierId?: string;
  quantity: number;
  charityPercentage: number;
  price: number;
  snapshotTitle?: string;
  snapshotImageUrl?: string;
  snapshotPlatform?: string;
  snapshotTierTitle?: string;
  snapshotTierPrice?: number;
  snapshotProducts: {
    productId: string;
    title: string;
    coverImageUrl: string;
    steamGameInfo?: {
      steamAppId?: number;
      packageId: string;
      steamKeyId: string;
    };
  }[];
}

export interface Cart {
  id: string;
  items: CartItem[];
  reservationStatus: "None" | "Active" | "Completed" | "Failed" | "Expired";
  reservedAt?: string;
  reservationExpiresAt?: string;
}

export interface AddToCartRequest {
  bundleId: string;
  tierId: string;
  charityPercentage: number;
  price: number;
}

// User related types
export interface BillingAddress {
  addressLine1: string;
  addressLine2: string;
  locality: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
}

export interface Customer {
  id: string;
  identityId: string;
  name: string;
  handle: string;
  createdAt: string;
  updatedAt: string;
  steamId?: string;
  steamConnectedAt?: string;
  billingAddress?: BillingAddress;
  contact: Contact;
}

// Common types
export interface Country {
  id: string;
  name: string;
  flag: string;
}
