import MediaData from "@/app/(shared)/types/media";
import { SteamApp } from "./steam-app";

// List view interface - simplified structure from API
export interface ExchangeGame {
  id: string;
  createdAt: string;
  updatedAt: string;
  steamAppId: number;
  status: "Active" | "Inactive";
  inputCredits: number;
  outputCredits: number;
  title: string;
  coverImage: MediaData;
}

// Details view interface - full structure with SteamApp details
export interface ExchangeGameDetails {
  id: string;
  publisherId: string;
  inputCredits: number;
  outputCredits: number;
  status: 'Active' | 'Inactive' | 'KeyToCreditsOnly' | 'CreditsToKeyOnly';
  createdAt: string;
  updatedAt: string;
  title: string;
  coverImage: MediaData;
  steamApp: SteamApp;
}
