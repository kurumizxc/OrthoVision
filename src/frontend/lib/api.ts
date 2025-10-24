/**
 * API utilities for communicating with the backend
 */

import type { DetectionResult } from "@/types/image";
import { API_BASE_URL } from "@/lib/config";

/**
 * Converts a File, base64 data URL, or regular URL to a FormData object
 *
 * @param file - File object, base64 data URL string, or regular URL string
 * @returns Promise resolving to FormData with the image file
 */
async function prepareFormData(file: File | string): Promise<FormData> {
  const formData = new FormData();

  if (typeof file === "string") {
    if (file.startsWith("data:")) {
      // Handle base64 data URL
      const base64Data = file.split(",")[1];
      const mimeType = file.match(/data:(.*?);/)?.[1] || "image/jpeg";
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      formData.append("image", blob, "image.jpg");
    } else {
      // Handle regular URL - fetch the image first
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${file}`);
      }
      const blob = await response.blob();
      formData.append("image", blob, "image.jpg");
    }
  } else {
    formData.append("image", file);
  }

  return formData;
}

/**
 * Detects fractures in an X-ray image by sending it to the backend
 *
 * @param image - File object, base64 data URL string, or regular URL string
 * @returns Detection results including class, confidence, recommendation, and annotated image
 * @throws Error if the request fails
 */
export async function detectFracture(
  image: File | string
): Promise<DetectionResult> {
  const formData = await prepareFormData(image);

  const response = await fetch(`${API_BASE_URL}/detect`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `Failed to detect fracture: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result as DetectionResult;
}
