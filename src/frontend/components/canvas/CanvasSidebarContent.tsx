"use client";

import { ImageInfo } from "./ImageInfo";
import { CanvasControls } from "./CanvasControls";
import { DetectionResults } from "./DetectionResults";
import { CanvasInfo } from "./CanvasInfo";
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

  const hasDetectionResult = !!image.detectionResult;
  const hasDetections = (image.detectionResult?.detections?.length || 0) > 0;

  return (
    <>
      <ImageInfo name={image.name} size={image.size} type={image.type} />

      <CanvasControls
        rotateImage={rotateImage}
        resetView={resetView}
        downloadCanvas={downloadCanvas}
        toggleBoundingBoxes={toggleBoundingBoxes}
        showBoundingBoxes={showBoundingBoxes}
        hasDetections={hasDetections}
      />

      {hasDetectionResult && image.detectionResult && (
        <DetectionResults detectionResult={image.detectionResult} />
      )}

      <CanvasInfo
        stageScale={stageScale}
        imageRotation={imageRotation}
        stagePosition={stagePosition}
      />
    </>
  );
}
