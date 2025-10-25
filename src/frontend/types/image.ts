export interface ImageData {
  name: string;
  size: number;
  type: string;
  url: string; // Base64 data URL 
}

// Api types for detection results and bounding boxes on images - Can be separated if needed
// Schema for API response
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

/**
 * Image and detection type contracts shared across UI and API, including
 * raw image metadata, detection result shape, and optional enrichment.
 */
