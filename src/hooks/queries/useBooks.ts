import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi, bundleApi } from "@/lib/api";
import {
  BookAssignmentDto,
  BookAssignmentQueryParams,
  BookDownloadUrlResponse,
  PaginatedBookAssignmentsResponse,
  BulkDownloadParams,
  BulkDownloadResponse
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

export function useBulkDownload() {
  const { downloadFile } = useFileDownload();

  return useMutation<
    BulkDownloadResponse,
    Error,
    BulkDownloadParams & { onProgress?: (progress: number) => void }
  >({
    mutationFn: (params) => bookApi.bulkDownload(params),
    onSuccess: async (data, variables) => {
      try {
        // Use the download URL to download the zip file
        await downloadFile(data.downloadUrl, `books-${Date.now()}.zip`);

        toast.success("Bulk download completed!", {
          description: 'Your books have been saved as a ZIP file'
        });
      } catch (error) {
        console.error('Bulk download error:', error);

        // Fallback to opening in new tab if blob download fails
        toast.warning("Direct download failed, opening in new tab...");
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error("Failed to generate bulk download. Please try again.");
      console.error('Bulk download error:', error);
    },
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
      try {
        // Use direct link download - browser handles everything natively
        await downloadFile(data.downloadUrl, variables.fileName);

        // Show success notification
        toast.success(`Download started: ${variables.fileName}`, {
          description: 'Check your browser\'s download manager for progress'
        });

        // Invalidate queries to refresh download count
        queryClient.invalidateQueries({ queryKey: ["bookAssignments"] });
        queryClient.invalidateQueries({ queryKey: ["bookAssignment", variables.assignmentId] });
      } catch (error) {
        console.error('Download error:', error);

        // Fallback to opening in new tab if direct download fails
        toast.warning("Direct download failed, opening in new tab...");
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: () => {
      toast.error("Failed to generate download link. Please try again.");
    },
  });
}