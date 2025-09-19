import MediaData from "@/app/(shared)/types/media";

export interface ExchangeableSteamKeyDto {
    steamKeyAssignmentId: string;
    packageId: string;
    packageName: string;
    publisherId: string;
    publisherName: string;
    productId: string;
    productTitle: string;
    coverImage?: MediaData;
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
    tierPrice?: number;
    creditsRequired: number;
}
