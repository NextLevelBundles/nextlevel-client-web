import { useState, useCallback } from 'react';

export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const downloadFile = useCallback(async (url: string, filename: string) => {
    if (!url) {
      throw new Error("Download URL not provided");
    }

    setIsDownloading(true);
    setError(null);

    try {
      // Use direct link approach - let browser handle the download natively
      // This prevents memory issues with large files and provides native browser download UI
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      link.target = '_blank'; // Open in new tab as fallback

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloading(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Download failed');
      setError(error);
      setIsDownloading(false);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setIsDownloading(false);
    setError(null);
  }, []);

  return {
    downloadFile,
    isDownloading,
    error,
    reset
  };
}