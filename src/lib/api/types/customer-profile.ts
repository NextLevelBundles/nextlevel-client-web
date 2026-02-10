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

export interface CustomerCollectionGame {
  id: string;
  steamAppId: number;
  gameId: string | null;
  name: string;
  coverImageId: string | null;
  steamIconUrl: string | null;
  playtimeForever: number;
  playtime2Weeks: number | null;
  releaseYear: number | null;
}

export interface UnimportedSteamGame {
  appId: number;
  name: string | null;
  imgIconUrl: string | null;
  playtimeForever: number;
  playtime2Weeks: number | null;
}

export interface ImportGamesRequest {
  steamAppIds: number[];
}

export interface ProfileStats {
  totalGames: number;
  totalPlaytimeMinutes: number;
  topGenre: string | null;
  mostPlayedGame: string | null;
  mostPlayedGameMinutes: number | null;
  genreBreakdown: GenreStat[];
  gameActivity: GameActivityList[];
  recentlyPlayed: RecentlyPlayedGame[];
}

export interface RecentlyPlayedGame {
  name: string;
  coverImageId: string | null;
  playtime2Weeks: number;
}

export interface GenreStat {
  name: string;
  count: number;
  percentage: number;
}

export interface GameActivityList {
  listName: string;
  systemName: string;
  items: GameActivityItem[];
}

export interface GameActivityItem {
  title: string | null;
  gameId: number | null;
  coverImageId: string | null;
}
