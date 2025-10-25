"use client";

import { ImageInfo } from "./ImageInfo";
import { CanvasControls } from "./CanvasControls";
import { DetectionResults } from "./DetectionResults";
import { useCanvas } from "./CanvasContext";

/**
 * CanvasSidebarContent organizes all sidebar sections
 */
export function CanvasSidebarContent() {
  const {
    image,
    imageRotation,
    stageScale,
    stagePosition,
    rotateImage,
    resetView,
    downloadCanvas,
    showBoundingBoxes,
    toggleBoundingBoxes,
  } = useCanvas();

  // Flags derived from detection result
  const hasDetectionResult = !!image.detectionResult;
  const hasDetections = (image.detectionResult?.detections?.length || 0) > 0;

  return (
    <>
      {/* Basic image metadata */}
      <ImageInfo name={image.name} size={image.size} type={image.type} />

      {/* Canvas action controls */}
      <CanvasControls
        rotateImage={rotateImage}
        resetView={resetView}
        downloadCanvas={downloadCanvas}
        toggleBoundingBoxes={toggleBoundingBoxes}
        showBoundingBoxes={showBoundingBoxes}
        hasDetections={hasDetections}
      />

      {/* Detection summary details */}
      {hasDetectionResult && image.detectionResult && (
        <DetectionResults detectionResult={image.detectionResult} />
      )}
    </>
  );
}

/**
 * Summary
 * CanvasSidebarContent composes the sidebar by showing image metadata,
 * canvas action controls, and detection results (when available).
 */
