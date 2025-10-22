import { useCallback } from "react";

/**
 * useFileToBase64 returns a memoized function that converts a File
 * to a data URL string for client-side previews and uploads.
 */
export function useFileToBase64() {
  return useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  }, []);
}
