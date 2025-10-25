"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { ImageDataWithResult } from "@/types/image";

const CanvasEditor = dynamic(() => import("./CanvasEditor").then(m => m.CanvasEditor), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading editor...</p>
      </div>
    </div>
  ),
});


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

    // Clear session when the page is being hidden/unloaded to prevent stale forward navigation
    const handleBeforeUnload = () => {
      try {
        sessionStorage.removeItem("uploadedImage");
      } catch {}
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        try {
          sessionStorage.removeItem("uploadedImage");
        } catch {}
      }
    };

    // If user navigates history (back/forward), ensure canvas requires fresh upload
    const handlePopState = () => {
      const has = sessionStorage.getItem("uploadedImage");
      if (!has) {
        router.push("/");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
    };
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
 * Client page that retrieves the uploaded image from sessionStorage.
 * If no image is found, the user is redirected to the home page; otherwise,
 * the CanvasEditor is rendered with the loaded image data.
 */
