import { SteamApp } from './steam-app';

export interface ExchangeGame {
  id: string;
  publisherId: string;
  inputCredits: number;
  outputCredits: number;
  status: 'Active' | 'Inactive' | 'KeyToCreditsOnly' | 'CreditsToKeyOnly';
  createdAt: string;
  updatedAt: string;
  steamApp: SteamApp;
}