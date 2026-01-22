export interface UpgradePreviewRequest {
  cartItemId: string;
  toBaseTierId: string;
  toCharityTierId?: string;
  toUpsellTierIds?: string[];
}

export interface UpgradePreviewResponse {
  upgradeId: string;
  cartItemId: string;
  toBaseTierId: string;
  toCharityTierId?: string;
  toUpsellTierIds: string[];
  baseTierUpgradeAmount: number;
  charityTierAmount: number;
  upsellAmount: number;
  totalAmount: number;
}

export interface UpgradeCompleteResponse {
  upgradeId: string;
  cartItemId: string;
  totalCharged: number;
  stripePaymentIntentId: string;
  completedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  email: string;
  displayName: string;
  bankName: string;
}

export interface PaymentStatusResponse {
  hasStripeCustomer: boolean;
  hasStripePaymentMethod: boolean;
  paymentMethod?: PaymentMethod;
}

export interface StripeSetupSessionRequest {
  successUrl: string;
  cancelUrl: string;
}

export interface StripeSetupSessionResponse {
  sessionId: string;
  url?: string;
}
