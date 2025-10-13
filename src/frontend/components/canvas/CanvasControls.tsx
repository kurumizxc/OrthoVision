import { memo } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RotateCw, Download, Home, Eye, EyeOff } from "lucide-react";

// Props for CanvasControls component
interface CanvasControlsProps {
  rotateImage: () => void;
  resetView: () => void;
  downloadCanvas: () => void;
  toggleBoundingBoxes: () => void;
  showBoundingBoxes: boolean;
  hasDetections: boolean;
}

export const CanvasControls = memo(function CanvasControls({
  rotateImage,
  resetView,
  downloadCanvas,
  toggleBoundingBoxes,
  showBoundingBoxes,
  hasDetections,
}: CanvasControlsProps) {
  return (
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
                {showBoundingBoxes ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showBoundingBoxes ? "Hide Detections" : "Show Detections"}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
