"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CanvasEditor } from "@/components/canvasEditor";
import type { ImageDataWithResult } from "@/types/image";

// This is a client-side page component for displaying the canvas editor
export default function CanvasPageClient() {
  // State to hold the uploaded image data (with detection results)
  const [image, setImage] = useState<ImageDataWithResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Try to retrieve the uploaded image from sessionStorage
    const stored = sessionStorage.getItem("uploadedImage");
    if (stored) {
      // If found, parse and set the image data
      setImage(JSON.parse(stored) as ImageDataWithResult);
    } else {
      // If not found, redirect to the home page
      router.push("/");
    }
  }, [router]);

  // Render the CanvasEditor if image data is available, otherwise show a loading message
  return image ? <CanvasEditor image={image} /> : <div>Loading...</div>;
}
