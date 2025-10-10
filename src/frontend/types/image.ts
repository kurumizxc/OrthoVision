export interface ImageData {
  name: string
  size: number
  type: string
  url: string // This will be a Base64 string when stored, and a Blob URL when used in components
}

export interface BoundingBox {
  id: number
  label: string
  box: [number, number, number, number] // [x1, y1, x2, y2]
}

export interface DetectionResult {
  class: "Fractured" | "Non Fractured"
  confidence: string
  recommendation: string
  imageWidth: number
  imageHeight: number
  detections: BoundingBox[]
}

export interface ImageDataWithResult extends ImageData {
  detectionResult?: DetectionResult
}
