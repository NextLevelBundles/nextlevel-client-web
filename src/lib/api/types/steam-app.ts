export interface SteamApp {
  id: number;
  type: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  releasedAt?: string;
  isFree: boolean;
  controllerSupport?: string;
  dlc?: number[];
  detailedDescription?: string;
  aboutTheGame?: string;
  shortDescription?: string;
  supportedLanguages?: string;
  headerImage?: string;
  capsuleImage?: string;
  capsuleImageV5?: string;
  website?: string;
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
  developers?: string[];
  publishers?: string[];
  priceOverview?: {
    currency: string;
    initial: number;
    final: number;
    discountPercent: number;
    initialFormatted: string;
    finalFormatted: string;
  };
  packages?: number[];
  packageGroups?: {
    name: string;
    title: string;
    description: string;
    selectionText: string;
    saveText: string;
    isRecurringSubscription: string;
    subs: {
      packageId: number;
      percentSavingsText: string;
      percentSavings: number;
      optionText: string;
      optionDescription: string;
      canGetFreeLicense: string;
      isFreeLicense: boolean;
      priceInCentsWithDiscount: number;
    }[];
  }[];
  platforms?: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  categories?: {
    id: number;
    description: string;
  }[];
  genres?: {
    id: string;
    description: string;
  }[];
  screenshots?: {
    id: number;
    pathThumbnail: string;
    pathFull: string;
  }[];
  movies?: {
    id: number;
    name: string;
    thumbnail: string;
    webm?: {
      video480: string;
      videoMax: string;
    };
    mp4?: {
      video480: string;
      videoMax: string;
    };
    highlight: boolean;
  }[];
  recommendations?: {
    total: number;
  };
  releaseDate?: {
    comingSoon: boolean;
    date: string;
  };
  supportInfo?: {
    url?: string;
    email?: string;
  };
  background?: string;
  backgroundRaw?: string;
  contentDescriptors?: {
    ids?: number[];
    notes?: string;
  };
  ratings?: {
    [key: string]: {
      rating: string;
      descriptors: string;
      banned: string;
      useAgeGate: string;
      ratingGenerated: string;
    };
  };
  fullGame?: {
    appId: string;
    name: string;
  };
  claimedById?: string;
}