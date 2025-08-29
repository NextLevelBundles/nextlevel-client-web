import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi } from "@/lib/api";
import { BookAssignmentDto, BookAssignmentQueryParams, BookDownloadUrlResponse } from "@/lib/api/types/book";
import { toast } from "sonner";

export function useBookAssignments(params?: BookAssignmentQueryParams) {
  return useQuery<BookAssignmentDto[]>({
    queryKey: ["bookAssignments", params],
    queryFn: () => bookApi.getBookAssignments(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useBookAssignment(assignmentId: string) {
  return useQuery<BookAssignmentDto>({
    queryKey: ["bookAssignment", assignmentId],
    queryFn: () => bookApi.getBookAssignment(assignmentId),
    enabled: !!assignmentId,
  });
}

export function useGenerateDownloadUrl() {
  const queryClient = useQueryClient();
  
  return useMutation<
    BookDownloadUrlResponse,
    Error,
    { assignmentId: string; bookFileId: string; fileName: string }
  >({
    mutationFn: ({ assignmentId, bookFileId }) =>
      bookApi.generateDownloadUrl(assignmentId, bookFileId),
    onSuccess: (data, variables) => {
      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank');
      
      toast.success(`Downloading ${variables.fileName}`);
      
      // Invalidate queries to refresh download count
      queryClient.invalidateQueries({ queryKey: ["bookAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["bookAssignment", variables.assignmentId] });
    },
    onError: () => {
      toast.error("Failed to generate download link. Please try again.");
    },
  });
}