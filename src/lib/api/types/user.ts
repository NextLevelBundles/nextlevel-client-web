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

// Status is returned as string from API, not number
export enum Status {
  Deleted = "Deleted",
  Active = "Active",
  Disabled = "Disabled"
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
  countryLastChangedAt?: string | null;
  billingAddress?: BillingAddress;
  contact: Contact;
  status: Status;
}
