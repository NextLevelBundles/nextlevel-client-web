export interface CustomerLocation {
  steamCountryCode: string | null;
  steamCountryName: string | null;
  steamCountryFlag: string | null;
  ipCountryCode: string | null;
  ipCountryName: string | null;
  ipCountryFlag: string | null;
  hasSteamCountry: boolean;
  hasIpCountry: boolean;
}