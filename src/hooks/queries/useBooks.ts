import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi, bundleApi } from "@/lib/api";
import {
  BookAssignmentDto,
  BookAssignmentQueryParams,
  BookDownloadUrlResponse,
  PaginatedBookAssignmentsResponse
} from "@/lib/api/types/book";
import { CustomerBundleDto } from "@/lib/api/types/bundle";
import { toast } from "sonner";
import { useFileDownload } from "@/hooks/useFileDownload";

export function useBookAssignments(params?: BookAssignmentQueryParams) {
  return useQuery<PaginatedBookAssignmentsResponse>({
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

export function useCustomerBundles() {
  return useQuery<CustomerBundleDto[]>({
    queryKey: ["customerBundles"],
    queryFn: () => bundleApi.getCustomerBundles(),
    staleTime: 60000, // 1 minute
  });
}

export function useGenerateDownloadUrl() {
  const queryClient = useQueryClient();
  const { downloadFile } = useFileDownload();
  
  return useMutation<
    BookDownloadUrlResponse,
    Error,
    { assignmentId: string; bookFileId: string; fileName: string }
  >({
    mutationFn: ({ assignmentId, bookFileId }) =>
      bookApi.generateDownloadUrl(assignmentId, bookFileId),
    onSuccess: async (data, variables) => {
      // Create a progress toast that we'll update
      const progressToast = toast.loading(`Downloading ${variables.fileName}...`, {
        description: 'Starting download...'
      });
      
      try {
        // Use our custom download function with progress tracking
        await downloadFile(data.downloadUrl, variables.fileName);
        
        // Dismiss progress toast and show success
        toast.dismiss(progressToast);
        toast.success(`Successfully downloaded ${variables.fileName}`, {
          description: 'File saved to your Downloads folder'
        });
        
        // Invalidate queries to refresh download count
        queryClient.invalidateQueries({ queryKey: ["bookAssignments"] });
        queryClient.invalidateQueries({ queryKey: ["bookAssignment", variables.assignmentId] });
      } catch (error) {
        toast.dismiss(progressToast);
        console.error('Download error:', error);
        
        // Fallback to opening in new tab if blob download fails
        toast.warning("Direct download failed, opening in new tab...");
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: () => {
      toast.error("Failed to generate download link. Please try again.");
    },
  });
}