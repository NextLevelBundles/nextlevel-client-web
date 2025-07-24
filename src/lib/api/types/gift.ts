export interface CartItemGift {
  id: string;
  cartItemId: string;
  productTitle: string;
  productDescription?: string;
  productImageUrl?: string;
  bundleName?: string;
  listingTitle?: string;
  giftedByCustomerName: string;
  giftedByCustomerId: string;
  recipientEmail: string;
  recipientName?: string;
  giftMessage?: string;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
  status: "Pending" | "Accepted" | "Expired" | "Declined";
  recipientHasAccount: boolean;
}

export interface SteamKeyGift {
  id: string;
  assignmentId: string;
  productTitle: string;
  productDescription?: string;
  productImageUrl?: string;
  bundleName?: string;
  giftedByCustomerName: string;
  giftedByCustomerId: string;
  recipientEmail: string;
  recipientName?: string;
  giftMessage?: string;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
  status: "Pending" | "Accepted" | "Expired" | "Declined";
  recipientHasAccount: boolean;
  steamGameMetadata?: {
    developers?: Array<{ name: string }>;
    publishers?: Array<{ name: string }>;
    releaseDate?: { date: string };
    platforms?: string[];
  };
}

export interface GiftDetailsRequest {
  email: string;
}

export interface AcceptGiftRequest {
  email: string;
}

export interface AcceptGiftResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}