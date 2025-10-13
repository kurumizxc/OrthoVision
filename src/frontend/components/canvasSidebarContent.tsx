"use client";

import type { ImageDataWithResult } from "@/types/image";
import { ImageInfo } from "./canvas/ImageInfo";
import { CanvasControls } from "./canvas/CanvasControls";
import { DetectionResults } from "./canvas/DetectionResults";
import { ControlsGuide } from "./canvas/ControlsGuide";
import { CanvasInfo } from "./canvas/CanvasInfo";

interface CanvasSidebarContentProps {
  image: ImageDataWithResult;
  imageRotation: number;
  stageScale: number;
  stagePosition: { x: number; y: number };
  rotateImage: () => void;
  resetView: () => void;
  downloadCanvas: () => void;
  showBoundingBoxes: boolean;
  toggleBoundingBoxes: () => void;
}

export function CanvasSidebarContent({
  image,
  imageRotation,
  stageScale,
  stagePosition,
  rotateImage,
  resetView,
  downloadCanvas,
  showBoundingBoxes,
  toggleBoundingBoxes,
}: CanvasSidebarContentProps) {
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

      <ControlsGuide />

      <CanvasInfo
        stageScale={stageScale}
        imageRotation={imageRotation}
        stagePosition={stagePosition}
      />
    </>
  );
}
