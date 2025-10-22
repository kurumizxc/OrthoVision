"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { UploadAnimated } from "@/components/ui/upload";

/**
 * UploadArea provides drag-and-drop and click-to-browse UX
 * Shows a preview when selected and allows clearing the file
 */

interface UploadAreaProps {
  imagePreview: string | null;
  currentImage: { name: string; size: number } | null;
  removeFile: () => void;
  onFileAccepted: (file: File) => void;
}

const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;

const isValidImageType = (file: File): boolean => {
  return VALID_IMAGE_TYPES.includes(
    file.type as (typeof VALID_IMAGE_TYPES)[number]
  );
};

export function UploadArea({
  imagePreview,
  currentImage,
  removeFile,
  onFileAccepted,
}: UploadAreaProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const droppedFile = acceptedFiles[0];
        if (isValidImageType(droppedFile)) {
          onFileAccepted(droppedFile);
        } else {
          alert("Please select a valid image file (JPG, PNG, JPEG)");
        }
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    multiple: false,
  });

  return (
    <div className="space-y-4">
      {!imagePreview ? (
        <div
          {...getRootProps()}
          className={`relative rounded-lg text-center transition-colors cursor-pointer h-64 w-64 flex flex-col items-center justify-center mx-auto ${
            isDragActive ? "bg-blue-50" : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <input {...getInputProps()} />
          <div>
            <UploadAnimated
              width={48}
              height={48}
              stroke="#9ca3af"
              className="mb-4"
            />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your image here, or click to browse
          </p>
          <p className="text-sm text-gray-500">Supports: JPG, PNG, JPEG</p>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden bg-gray-100 h-64 w-64 mx-auto">
          <div className="relative h-full w-full">
            <Image
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-2 right-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={removeFile}
              className="bg-white/80 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-sm font-medium text-white truncate">
              {currentImage?.name}
            </p>
            <p className="text-xs text-white/80">
              {currentImage ? (currentImage.size / 1024 / 1024).toFixed(2) : 0}{" "}
              MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
