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
