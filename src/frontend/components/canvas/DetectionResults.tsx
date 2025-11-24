import { memo } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import type { ImageDataWithResult } from "@/types/image";

interface DetectionResultsProps {
  detectionResult: NonNullable<ImageDataWithResult["detectionResult"]>;
}

export const DetectionResults = memo(function DetectionResults({
  detectionResult,
}: DetectionResultsProps) {
  const isFractured = detectionResult.class === "Fractured";
  const hasDetections = (detectionResult.detections?.length || 0) > 0;
  const hasModelInfo = detectionResult.model_used && detectionResult.model_used !== "None";
  const hasWarning = detectionResult.warning;

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
              Fracture area(s) found.
            </p>
          )}
          <p className="text-justify">
            <strong>Recommendation:</strong> {detectionResult.recommendation}
          </p>
          {hasModelInfo && (
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
              <strong>Detection Model:</strong> {detectionResult.model_used}
            </p>
          )}
          {hasWarning && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-300">
              <strong>⚠️ Notice:</strong> {detectionResult.warning}
            </p>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});

/**
 * DetectionResults shows classification, confidence, count of detections,
 * the textual recommendation returned by the backend, which YOLO model
 * was used for detection (cascade feature), and any warnings if manual
 * review is recommended.
 */
