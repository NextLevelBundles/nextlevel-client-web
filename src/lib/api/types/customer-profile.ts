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
  slug: string | null;
  releaseYear: number | null;
  order: number;
  genre: string | null;
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

export interface CustomerProfile {
  id: string;
  handle: string;
  name: string | null;
  title: string | null;
  headline: string | null;
  specialties: string | null;
  isCurator: boolean;
  pictureUrl: string | null;
  socialHandles: SocialHandle[];
  charities: ProfileCharity[];
}

export interface CuratorProfile {
  curatedBundlesCount: number;
  leadCuratedCount: number;
  guestCuratedCount: number;
  genreFocusTags: string[];
  curatedBundles: CuratedBundle[];
}

export interface CuratedBundle {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  curatorRole: string;
  quote: string | null;
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

export interface UpdateCustomerProfileRequest {
  name: string | null;
  title: string | null;
  headline: string | null;
  specialties: string | null;
  socialHandles: SocialHandle[];
  charities: ProfileCharity[];
}

export interface CustomerGame {
  id: string;
  steamAppId: number;
  gameId: string;
  slug: string | null;
  name: string;
  coverImageId: string | null;
  steamIconUrl: string | null;
  playtimeForever: number;
  playtime2Weeks: number | null;
  releaseYear: number | null;
  playStatus: string;
  completionStatus: string | null;
}

export interface UpdateCollectionGameStatusRequest {
  playStatus: string;
  completionStatus: string | null;
}

export interface UnimportedSteamGame {
  appId: number;
  name: string | null;
  imgIconUrl: string | null;
  playtimeForever: number;
  playtime2Weeks: number | null;
}

export interface ImportGameStatus {
  playStatus?: string;
  completionStatus?: string | null;
}

export interface ImportGamesRequest {
  steamAppIds: number[];
  statuses?: Record<number, ImportGameStatus>;
}

export interface SetGamesRemovedRequest {
  appIds: number[];
  isRemoved: boolean;
}

export interface ProfileStats {
  totalGames: number;
  totalPlaytimeMinutes: number;
  topGenre: string | null;
  mostPlayedGame: string | null;
  mostPlayedGameMinutes: number | null;
  genreBreakdown: GenreStat[];
  completionBreakdown: CompletionStat[];
  gameActivity: GameActivityList[];
  recentlyPlayed: RecentlyPlayedGame[];
}

export interface CompletionStat {
  name: string;
  count: number;
  percentage: number;
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
  slug: string | null;
}

export interface ProfileAchievements {
  totalEarnedAchievements: number;
  games: GameAchievementProgress[];
}

export interface GameAchievementProgress {
  appId: number;
  gameName: string;
  coverImageId: string | null;
  totalAchievements: number;
  earnedAchievements: number;
  completionPercentage: number;
  lastUnlockTime: string | null;
  earnedAchievementsList: EarnedAchievement[];
}

export interface EarnedAchievement {
  apiName: string;
  unlockTime: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
