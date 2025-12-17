import { ClientApi } from "../client-api";
import {
  BookAssignmentDto,
  BookDownloadUrlResponse,
  BookAssignmentQueryParams,
  PaginatedBookAssignmentsResponse,
  BulkDownloadParams,
  BulkDownloadResponse,
  BulkDownloadByIdsParams
} from "../types/book";

export class BookClient {
  constructor(private api: ClientApi) {}

  async getBookGenres(): Promise<string[]> {
    return this.api.get<string[]>('/customer/book-assignments/genres');
  }

  async getBookAssignments(params?: BookAssignmentQueryParams): Promise<PaginatedBookAssignmentsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.fromDate) {
      queryParams.append('fromDate', params.fromDate);
    }
    if (params?.toDate) {
      queryParams.append('toDate', params.toDate);
    }
    if (params?.bundleId) {
      queryParams.append('bundleId', params.bundleId);
    }
    if (params?.hasDownloadedBefore !== undefined) {
      queryParams.append('hasDownloadedBefore', params.hasDownloadedBefore.toString());
    }
    if (params?.giftFilter && params.giftFilter !== 'All') {
      queryParams.append('giftFilter', params.giftFilter);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.genres) {
      queryParams.append('genres', params.genres);
    }
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    const endpoint = `/customer/book-assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.api.get<PaginatedBookAssignmentsResponse>(endpoint);
  }

  async getBookAssignment(assignmentId: string): Promise<BookAssignmentDto> {
    return this.api.get<BookAssignmentDto>(`/customer/book-assignments/${assignmentId}`);
  }

  async generateDownloadUrl(
    assignmentId: string,
    bookFileId: string
  ): Promise<BookDownloadUrlResponse> {
    return this.api.post<BookDownloadUrlResponse>(
      `/customer/book-assignments/${assignmentId}/download-url/${bookFileId}`
    );
  }

  async bulkDownload(params: BulkDownloadParams): Promise<BulkDownloadResponse> {
    const queryParams = new URLSearchParams();

    // Add all filter parameters
    if (params?.fromDate) {
      queryParams.append('fromDate', params.fromDate);
    }
    if (params?.toDate) {
      queryParams.append('toDate', params.toDate);
    }
    if (params?.bundleId) {
      queryParams.append('bundleId', params.bundleId);
    }
    if (params?.hasDownloadedBefore !== undefined) {
      queryParams.append('hasDownloadedBefore', params.hasDownloadedBefore.toString());
    }
    if (params?.giftFilter && params.giftFilter !== 'All') {
      queryParams.append('giftFilter', params.giftFilter);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.genres) {
      queryParams.append('genres', params.genres);
    }
    // Always add preferredFileType
    queryParams.append('preferredFileType', params.preferredFileType);

    const endpoint = `/customer/book-assignments/bulk-download${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.api.post<BulkDownloadResponse>(endpoint);
  }

  async bulkDownloadByIds(params: BulkDownloadByIdsParams): Promise<BulkDownloadResponse> {
    return this.api.post<BulkDownloadResponse>(
      '/customer/book-assignments/bulk-download-by-ids',
      params
    );
  }
}