import { ClientApi } from "../client-api";
import { 
  BookAssignmentDto, 
  BookDownloadUrlResponse,
  BookAssignmentQueryParams 
} from "../types/book";

export class BookClient {
  constructor(private api: ClientApi) {}

  async getBookAssignments(params?: BookAssignmentQueryParams): Promise<BookAssignmentDto[]> {
    const queryParams = new URLSearchParams();
    if (params?.giftFilter) {
      queryParams.append('giftFilter', params.giftFilter);
    }
    
    const endpoint = `/customer/book-assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.api.get<BookAssignmentDto[]>(endpoint);
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