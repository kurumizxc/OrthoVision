"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { RotateCw, Download, Home, Eye, EyeOff } from "lucide-react"
import type { ImageDataWithResult } from "@/types/image"

interface CanvasSidebarContentProps {
  image: ImageDataWithResult
  imageRotation: number
  stageScale: number
  stagePosition: { x: number; y: number }
  rotateImage: () => void
  resetView: () => void
  downloadCanvas: () => void
  showBoundingBoxes: boolean
  toggleBoundingBoxes: () => void
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
  const hasDetectionResult = !!image.detectionResult
  const isFractured = image.detectionResult?.class === "Fractured"
  const hasDetections = (image.detectionResult?.detections?.length || 0) > 0
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Image Info</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="p-3 text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900 break-all" title={image.name}>
              {image.name.length > 12 ? `${image.name.substring(0, 12)}...` : image.name}
            </p>
            <p>Size: {(image.size / 1024 / 1024).toFixed(2)} MB</p>
            <p>Type: {image.type}</p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Canvas Tools</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={rotateImage}>
                <RotateCw className="h-4 w-4" />
                Rotate
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={resetView}>
                <Home className="h-4 w-4" />
                Reset View
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={downloadCanvas}>
                <Download className="h-4 w-4" />
                Download Image
              </SidebarMenuButton>
            </SidebarMenuItem>
            {hasDetections && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleBoundingBoxes}>
                  {showBoundingBoxes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showBoundingBoxes ? "Hide Detections" : "Show Detections"}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {hasDetectionResult && image.detectionResult && (
        <SidebarGroup>
          <SidebarGroupLabel>Detection Results</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-3 text-sm text-gray-600 space-y-2">
              <p>
                <strong>Findings:</strong>{" "}
                <span className={isFractured ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                  {image.detectionResult.class}
                </span>
              </p>
              <p>
                <strong>Confidence:</strong> {image.detectionResult.confidence}
              </p>
              {hasDetections && (
                <p>
                  <strong>Detections:</strong> {image.detectionResult.detections.length} fracture area(s) found
                </p>
              )}
              <p className="text-justify">
                <strong>Recommendation:</strong> {image.detectionResult.recommendation}
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      <SidebarGroup>
        <SidebarGroupLabel>Controls</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="p-3 text-sm text-gray-600 space-y-2">
            <p>
              • <strong>Mouse Wheel:</strong> Zoom in/out
            </p>
            <p>
              • <strong>Drag Canvas:</strong> Pan around
            </p>
            <p>
              • <strong>Rotate Button:</strong> 90° clockwise
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Canvas Info</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="p-3 text-sm text-gray-600 space-y-1">
            <p>Zoom: {Math.round(stageScale * 100)}%</p>
            <p>Rotation: {imageRotation}°</p>
            <p>
              Pan: ({Math.round(stagePosition.x)}, {Math.round(stagePosition.y)})
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
