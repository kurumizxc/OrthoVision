export interface ImageData {
  name: string
  size: number
  type: string
  url: string // This will be a Base64 string when stored, and a Blob URL when used in components
}
