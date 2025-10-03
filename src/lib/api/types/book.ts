import MediaData from "@/app/(shared)/types/media";

export enum BookAssignmentStatus {
  Active = "Active",
  Inactive = "Inactive",
  Refunded = "Refunded",
  Expired = "Expired",
}

export enum BookFileStatus {
  Active = "Active",
  Inactive = "Inactive",
  Deleted = "Deleted",
}

export interface BookDto {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  isbn?: string;
  isbN13?: string;
  publisherId?: string;
  publisherName?: string;
  description?: string;
  genre?: string;
  pageCount?: number;
  language?: string;
  edition?: string;
  publicationDate?: string;
  coverImage?: MediaData;
  status: string;
  price: number;
  fileCount: number;
  availableFormats: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface BookFileDto {
  id: string;
  bookId: string;
  fileName: string;
  fileFormat: string;
  fileSizeBytes: number;
  status: BookFileStatus | string;
  uploadedAt: string;
}

export interface BookAssignmentDto {
  id: string;
  bookId: string;
  customerId: string;
  productId: string;
  productTitle: string;
  productCoverImage?: MediaData;
  book?: BookDto;
  bookTitle?: string; // For backward compatibility
  availableFiles?: BookFileDto[];
  status: BookAssignmentStatus | string;
  assignedAt: string;
  downloadCount: number;
  lastDownloadAt?: string;
  isGift: boolean;
}

export interface PaginatedBookAssignmentsResponse {
  items: BookAssignmentDto[];
  total: number;
  pageSize: number;
  page: number;
}

export interface BookDownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface BookAssignmentQueryParams {
  fromDate?: string; // Purchase date after
  toDate?: string; // Purchase date before
  bundleId?: string; // Filter by bundle
  hasDownloadedBefore?: boolean; // Filter by download status
  giftFilter?: "All" | "ReceivedByMe" | "Owned";
  search?: string; // Search query
  page?: number;
  pageSize?: number;
}
