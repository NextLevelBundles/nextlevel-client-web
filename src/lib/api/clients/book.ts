import { ClientApi } from "../client-api";
import {
  BookAssignmentDto,
  BookDownloadUrlResponse,
  BookAssignmentQueryParams,
  PaginatedBookAssignmentsResponse
} from "../types/book";

export class BookClient {
  constructor(private api: ClientApi) {}

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
}