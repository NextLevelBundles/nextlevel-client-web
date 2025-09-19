import MediaData from "@/app/(shared)/types/media";

export enum BookAssignmentStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export enum BookFileStatus {
  Active = "Active",
  Inactive = "Inactive",
  Deleted = "Deleted",
}

export interface BookFileDto {
  id: string;
  fileName: string;
  fileFormat: string;
  fileSizeBytes: number;
  status: BookFileStatus;
}

export interface BookAssignmentDto {
  id: string;
  bookId: string;
  customerId: string;
  productId: string;
  productTitle?: string;
  productCoverImage?: MediaData;
  bookTitle?: string;
  availableFiles?: BookFileDto[];
  status: BookAssignmentStatus;
  assignedAt: string;
  downloadCount: number;
  lastDownloadAt?: string;
  isGift: boolean;
}

export interface BookDownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface BookAssignmentQueryParams {
  giftFilter?: "All" | "ReceivedByMe" | "Owned";
}
