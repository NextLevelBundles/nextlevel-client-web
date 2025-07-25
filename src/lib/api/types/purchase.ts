export type GiftFilterType =
  | "All"
  | "Owned"
  | "Gifted"
  | "GivenByMe"
  | "ReceivedByMe";

export interface PurchaseQueryParams {
  sortBy?: "Title" | "Date" | "Price" | "Quantity" | "CharityAmount";
  sortDirection?: "Ascending" | "Descending";
  year?: "2025" | "2024";
  searchQuery?: string;
  giftFilter?: GiftFilterType;
}
