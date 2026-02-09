export interface CustomerList {
  id: string;
  name: string;
  systemName: string | null;
  description: string | null;
  itemCount: number;
  previewCoverImageIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListDetail {
  id: string;
  name: string;
  systemName: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  items: CustomerListItem[];
}

export interface CustomerListItem {
  id: string;
  gameId: number | null;
  title: string | null;
  coverImageId: string | null;
  releaseYear: number | null;
  order: number;
}

export interface GameSearchResult {
  igdbId: number;
  name: string | null;
  coverImageId: string | null;
  releaseYear: number | null;
}

export interface CreateCustomerListRequest {
  name: string;
  description?: string;
}

export interface UpdateCustomerListRequest {
  name: string;
  description?: string;
}

export interface AddListItemRequest {
  gameId: number;
}

export interface CommunityProfile {
  id: string;
  handle: string;
  title: string | null;
  headline: string | null;
  specialties: string | null;
  socialHandles: SocialHandle[];
  charities: ProfileCharity[];
}

export interface SocialHandle {
  platform: string;
  handle: string;
  url: string | null;
}

export interface ProfileCharity {
  name: string;
  link: string | null;
  logo: string | null;
  description: string | null;
}

export interface UpdateCommunityProfileRequest {
  title: string | null;
  headline: string | null;
  specialties: string | null;
  socialHandles: SocialHandle[];
  charities: ProfileCharity[];
}
