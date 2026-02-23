export interface GameDetail {
  id: string;
  igdbId: number;
  name: string | null;
  slug: string | null;
  summary: string | null;
  storyline: string | null;
  coverImageId: string | null;
  coverImageUrl: string | null;
  firstReleaseDate: string | null;
  aggregatedRating: number | null;
  aggregatedRatingCount: number | null;
  totalRating: number | null;
  totalRatingCount: number | null;
  franchiseName: string | null;
  genres: GameDetailGenre[];
  themes: GameDetailTheme[];
  developers: GameDetailCompany[];
  publishers: GameDetailCompany[];
  platforms: GameDetailPlatform[];
  gameModes: GameDetailGameMode[];
  playerPerspectives: GameDetailPlayerPerspective[];
  gameEngines: GameDetailEngine[];
  releaseDates: GameDetailReleaseDate[];
  ageRatings: GameDetailAgeRating[];
  screenshots: GameDetailScreenshot[];
  artworks: GameDetailArtwork[];
  videos: GameDetailVideo[];
  websites: GameDetailWebsite[];
  relatedGames: GameDetailRelatedGame[];
}

export interface GameDetailGenre {
  name: string | null;
  slug: string | null;
}

export interface GameDetailTheme {
  name: string | null;
  slug: string | null;
}

export interface GameDetailCompany {
  name: string | null;
}

export interface GameDetailPlatform {
  name: string | null;
  abbreviation: string | null;
}

export interface GameDetailGameMode {
  name: string | null;
}

export interface GameDetailPlayerPerspective {
  name: string | null;
}

export interface GameDetailEngine {
  name: string | null;
}

export interface GameDetailReleaseDate {
  platformName: string | null;
  date: number | null;
  region: string | null;
}

export interface GameDetailAgeRating {
  rating: string | null;
  organization: string | null;
}

export interface GameDetailScreenshot {
  imageId: string | null;
  imageUrl: string | null;
}

export interface GameDetailArtwork {
  imageId: string | null;
  imageUrl: string | null;
}

export interface GameDetailVideo {
  name: string | null;
  videoId: string | null;
}

export interface GameDetailWebsite {
  type: number | null;
  url: string | null;
}

export interface GameDetailRelatedGame {
  igdbId: number;
  name: string | null;
  coverImageId: string | null;
  coverImageUrl: string | null;
  relationship: string;
}
