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
  createdAt: string;
  updatedAt: string;
  steamId?: string;
  steamUsername?: string;
  steamConnectedAt?: string;
  steamCountry?: string;
  countryCode: string;
  country?: Country;
  countryLastChangedAt?: string | null;
  billingAddress?: BillingAddress;
  contact: Contact;
}
