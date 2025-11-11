import { SteamApp } from './steam-app';

// Image type for exchange game cover
export interface ExchangeGameImage {
  id: string;
  s3Key: string;
  fileName: string;
  createdAt: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

// List view interface - simplified structure from API
export interface ExchangeGame {
  id: string;
  createdAt: string;
  updatedAt: string;
  steamAppId: number;
  status: 'Active' | 'Inactive';
  inputCredits: number;
  outputCredits: number;
  title: string;
  coverImage: ExchangeGameImage;
}

// Details view interface - full structure with SteamApp details
export interface ExchangeGameDetails {
  id: string;
  publisherId: string;
  inputCredits: number;
  outputCredits: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  title: string;
  coverImage: ExchangeGameImage;
  steamApp: SteamApp;
}