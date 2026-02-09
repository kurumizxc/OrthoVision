"use client";

import { useEffect, useState } from "react";
import { ImageInfo } from "./ImageInfo";
import { CanvasControls } from "./CanvasControls";
import { DetectionResults } from "./DetectionResults";
import { useCanvas } from "./CanvasContext";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";


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
    confidenceThreshold,
    setConfidenceThreshold,
  } = useCanvas();

  const [confidenceInputValue, setConfidenceInputValue] = useState(
    confidenceThreshold.toFixed(2)
  );
  const [isEditingConfidence, setIsEditingConfidence] = useState(false);

  useEffect(() => {
    if (isEditingConfidence) return;
    setConfidenceInputValue(confidenceThreshold.toFixed(2));
  }, [confidenceThreshold, isEditingConfidence]);

  const commitConfidenceInputValue = () => {
    const parsed = Number.parseFloat(confidenceInputValue);
    if (Number.isNaN(parsed)) {
      setConfidenceInputValue(confidenceThreshold.toFixed(2));
      return;
    }

    const clamped = Math.max(0, Math.min(1, parsed));
    setConfidenceThreshold(clamped);
    setConfidenceInputValue(clamped.toFixed(2));
  };

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

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-3 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Confidence Threshold</span>
              <Input
                className="h-8 w-20 text-right tabular-nums"
                inputMode="decimal"
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={confidenceInputValue}
                onFocus={() => setIsEditingConfidence(true)}
                onBlur={() => {
                  setIsEditingConfidence(false);
                  commitConfidenceInputValue();
                }}
                onChange={(event) => {
                  setConfidenceInputValue(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.currentTarget.blur();
                }}
              />
            </div>
            <Slider
              value={[confidenceThreshold]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => {
                setConfidenceThreshold(value[0] ?? 0.3);
              }}
            />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

/**
 * CanvasSidebarContent composes the sidebar by showing image metadata,
 * canvas action controls, and detection results (when available).
 */
