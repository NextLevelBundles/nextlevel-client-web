export interface LocationCountry {
  id: string;
  name: string;
  flag: string;
}

export interface CustomerLocation {
  isSteamLinked: boolean;
  steamId: string | null;
  steamConnectedAt: string | null;
  steamCountryCode: string | null;
  steamCountryName: string | null;
  steamCountryFlag: string | null;
  ipCountryCode: string | null;
  ipCountryName: string | null;
  ipCountryFlag: string | null;
  hasSteamCountry: boolean;
  hasIpCountry: boolean;
  ipCountry: LocationCountry | null;
  profileCountry: LocationCountry;
}