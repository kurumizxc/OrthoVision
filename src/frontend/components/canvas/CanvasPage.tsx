"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CanvasEditor } from "./CanvasEditor";
import type { ImageDataWithResult } from "@/types/image";

/**
 * CanvasPage - Client component that loads image from sessionStorage
 * Redirects to home if no image is available
 */
export function CanvasPage() {
  const [image, setImage] = useState<ImageDataWithResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load image from session and redirect home if missing
    const stored = sessionStorage.getItem("uploadedImage");
    if (stored) {
      setImage(JSON.parse(stored) as ImageDataWithResult);
    } else {
      router.push("/");
    }
  }, [router]);

  if (!image) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <CanvasEditor image={image} />;
}

/**
 * Summary
 * Client page that retrieves the uploaded image from sessionStorage.
 * If no image is found, the user is redirected to the home page; otherwise,
 * the CanvasEditor is rendered with the loaded image data.
 */
