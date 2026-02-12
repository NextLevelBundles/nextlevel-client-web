import { Country } from "./common";

export interface BillingAddress {
  addressLine1: string;
  addressLine2: string;
  locality: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
}

export interface Customer {
  id: string;
  identityId: string;
  name: string;
  email: string;
  handle: string;
  type?: string;
  pictureUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  steamId?: string;
  steamUsername?: string;
  steamConnectedAt?: string;
  steamCountry?: string;
  steamLevel?: string;
  steamLibraryLastSyncedAt?: string;
  steamLibrarySyncStatus?: string;
  countryCode: string;
  country?: Country;
  countryLastChangedAt?: string | null;
  billingAddress?: BillingAddress;
  contact: Contact;
}

export interface SteamLevelSyncResponse {
  isSuccess: boolean;
  steamLevel?: string;
  errorMessage?: string;
}
