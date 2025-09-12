import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const downloadFile = useCallback(async (url: string, filename: string) => {
    if (!url) {
      throw new Error("Download URL not provided");
    }

    setIsDownloading(true);
    setError(null);
    setProgress({ loaded: 0, total: 0, percentage: 0 });

    try {
      // Create XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();
      
      // Create promise to handle the download
      const downloadPromise = new Promise<Blob>((resolve, reject) => {
        xhr.responseType = 'blob';
        
        // Track download progress
        xhr.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setProgress({
              loaded: event.loaded,
              total: event.total,
              percentage
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Download failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error occurred during download'));
        };

        xhr.onabort = () => {
          reject(new Error('Download was aborted'));
        };

        xhr.open('GET', url);
        xhr.send();
      });

      // Wait for download to complete
      const blob = await downloadPromise;

      // Create blob URL and trigger download
      const blobURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobURL;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobURL);
      }, 100);

      setIsDownloading(false);
      setProgress(null);
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Download failed');
      setError(error);
      setIsDownloading(false);
      setProgress(null);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setIsDownloading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    downloadFile,
    isDownloading,
    progress,
    error,
    reset
  };
}