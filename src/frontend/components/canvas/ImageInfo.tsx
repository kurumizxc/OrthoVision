import { memo } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

interface ImageInfoProps {
  name: string;
  size: number;
  type: string;
}

export const ImageInfo = memo(function ImageInfo({
  name,
  size,
  type,
}: ImageInfoProps) {
  const displayName = name.length > 12 ? `${name.substring(0, 12)}...` : name;
  const sizeInMB = (size / 1024 / 1024).toFixed(2);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Image Info</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="p-3 text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-900 break-all" title={name}>
            {displayName}
          </p>
          <p>Size: {sizeInMB} MB</p>
          <p>Type: {type}</p>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
