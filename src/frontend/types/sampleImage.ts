/**
 * Types and sample data for built-in demo images used on the upload page.
 */
import type { ImageData } from "./image";

export interface SampleImage extends ImageData {
  id: number;
}

// Demo images used on the upload page when the user picks a sample
export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 1,
    name: "sample-xray-1.jpeg",
    url: "/images/sample-xray-1.jpeg",
    size: 716800,
    type: "image/jpeg",
  },
  {
    id: 2,
    name: "sample-xray-2.jpeg",
    url: "/images/sample-xray-2.jpeg",
    size: 307200,
    type: "image/jpeg",
  },
  {
    id: 3,
    name: "sample-xray-3.jpeg",
    url: "/images/sample-xray-3.jpeg",
    size: 307200,
    type: "image/jpeg",
  },
  {
    id: 4,
    name: "sample-xray-4.jpeg",
    url: "/images/sample-xray-4.jpeg",
    size: 307200,
    type: "image/jpeg",
  },
];

/**
 * SampleImage extends basic image metadata with an identifier and provides
 * a small in-app dataset for quick demos on the upload page.
 */
