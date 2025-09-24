"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { RotateCw, Download, Home } from "lucide-react"
import type { ImageData } from "@/types/image"

interface CanvasSidebarContentProps {
  image: ImageData
  imageRotation: number
  stageScale: number
  stagePosition: { x: number; y: number }
  rotateImage: () => void
  resetView: () => void
  downloadCanvas: () => void
}

export function CanvasSidebarContent({
  image,
  imageRotation,
  stageScale,
  stagePosition,
  rotateImage,
  resetView,
  downloadCanvas,
}: CanvasSidebarContentProps) {
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
                Download Canvas
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Results</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="p-3 text-sm text-gray-600 space-y-2">
            <p>
              <strong>Findings:</strong> Fractured {/* Non Fractured */}
            </p>
            <p>
              <strong>Confidence:</strong> 99% {/* Confident Percent */}
            </p>
            <p className="text-justify">
              <strong>Recommendation:</strong> Fracture identified on the imaging results. Please monitor the condition closely and refer to orthopedics for further evaluation and management. {/* No signs of fracture on the imaging results. Please monitor the condition and refer to orthopedics for further evaluation if needed */}
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

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
              • <strong>Drag Image:</strong> Move image
            </p>
            <p>
              • <strong>Rotate:</strong> 90° clockwise
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
