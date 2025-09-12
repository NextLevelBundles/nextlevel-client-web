export interface ExchangeableSteamKeyDto {
    id: string;
    packageId: string;
    packageName: string;
    publisherId: string;
    publisherName: string;
    productId: string;
    productTitle: string;
    steamGameMetadata?: {
        website?: string;
        protonDbTier?: string;
        pcRequirements?: {
            minimum?: string;
            recommended?: string;
        };
        macRequirements?: {
            minimum?: string;
            recommended?: string;
        };
        linuxRequirements?: {
            minimum?: string;
            recommended?: string;
        };
        developers?: Array<{
            name: string;
            website?: string;
        }>;
        publishers?: Array<{
            name: string;
            website?: string;
        }>;
        releaseDate?: {
            date: string;
        } | null;
        platforms?: string[];
        trailerUrl?: string;
        screenshotUrlsJson?: string | null;
        steamAppId?: number;
    };
    effectivePrice: number;
    isFromBundle: boolean;
    tierPrice?: number;
    productPrice: number;
    creditsRequired: number;
    addedToExchangeAt: string;
}
