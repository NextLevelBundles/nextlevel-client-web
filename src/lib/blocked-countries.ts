export const BLOCKED_COUNTRIES = [
  "CN", // China
  "RU", // Russia
  "KP", // North Korea
  "IR", // Iran
  "SY", // Syria
  "CU", // Cuba
  "BY", // Belarus
] as const;

export type BlockedCountry = (typeof BLOCKED_COUNTRIES)[number];

export function isCountryBlocked(
  countryCode: string | null | undefined
): boolean {
  if (!countryCode) return false;
  return BLOCKED_COUNTRIES.includes(
    countryCode.toUpperCase() as BlockedCountry
  );
}
