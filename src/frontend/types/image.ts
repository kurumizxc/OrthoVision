/**
 * Types for image payloads and detection results shared between UI and API.
 */
export interface ImageData {
  name: string;
  size: number;
  type: string;
  url: string; // Base64 data URL (data:image/...) or public path (/images/...)
}

// Api types for detection results and bounding boxes on images - Can be separated if needed

export interface BoundingBox {
  id: number;
  label: string;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface DetectionResult {
  class: "Fractured" | "Non Fractured";
  confidence: string;
  recommendation: string;
  imageWidth: number;
  imageHeight: number;
  detections: BoundingBox[];
}

export interface ImageDataWithResult extends ImageData {
  detectionResult?: DetectionResult;
}
