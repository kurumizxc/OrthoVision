import { memo } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

export const ControlsGuide = memo(function ControlsGuide() {
  return (
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
  );
});
