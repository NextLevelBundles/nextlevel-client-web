export interface Country {
  id: string;
  name: string;
  flag: string;
}

// Generic API response wrapper (if needed in the future)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination types (if needed in the future)
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
