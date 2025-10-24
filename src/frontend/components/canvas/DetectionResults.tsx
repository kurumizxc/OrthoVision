import { memo } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import type { ImageDataWithResult } from "@/types/image";

/**
 * DetectionResults shows classification, confidence, count of detections,
 * and the textual recommendation returned by the backend.
 */

interface DetectionResultsProps {
  detectionResult: NonNullable<ImageDataWithResult["detectionResult"]>;
}

export const DetectionResults = memo(function DetectionResults({
  detectionResult,
}: DetectionResultsProps) {
  const isFractured = detectionResult.class === "Fractured";
  const hasDetections = (detectionResult.detections?.length || 0) > 0;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Detection Results</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="p-3 text-sm text-gray-600 space-y-2">
          <p>
            <strong>Findings:</strong>{" "}
            <span
              className={
                isFractured
                  ? "text-red-600 font-semibold"
                  : "text-green-600 font-semibold"
              }
            >
              {detectionResult.class}
            </span>
          </p>
          <p>
            <strong>Confidence:</strong> {detectionResult.confidence}
          </p>
          {hasDetections && (
            <p>
              <strong>Detections:</strong> {detectionResult.detections.length}{" "}
              Fracture area(s) found
            </p>
          )}
          <p className="text-justify">
            <strong>Recommendation:</strong> {detectionResult.recommendation}
          </p>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
