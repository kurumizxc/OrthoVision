import { memo } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

interface CanvasInfoProps {
  stageScale: number;
  imageRotation: number;
  stagePosition: { x: number; y: number };
}

const InfoItem = memo(function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p>
      {label}: {value}
    </p>
  );
});

export const CanvasInfo = memo(function CanvasInfo({
  stageScale,
  imageRotation,
  stagePosition,
}: CanvasInfoProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Canvas Info</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="p-3 text-sm text-gray-600 space-y-1">
          <InfoItem label="Zoom" value={`${Math.round(stageScale * 100)}%`} />
          <InfoItem label="Rotation" value={`${imageRotation}°`} />
          <InfoItem
            label="Pan"
            value={`(${Math.round(stagePosition.x)}, ${Math.round(
              stagePosition.y
            )})`}
          />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
