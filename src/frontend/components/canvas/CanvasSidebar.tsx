"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from "@/components/ui/sidebar";
import { CanvasSidebarContent } from "./CanvasSidebarContent";
import { useCanvas } from "./CanvasContext";

/**
 * CanvasSidebar provides navigation and displays canvas controls
 */
export function CanvasSidebar() {
  // Ensure we are within provider
  useCanvas();
  const router = useRouter();

  const handleBackClick = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <Sidebar
      side="left"
      mobileSide="top"
      collapsible="offcanvas"
      className="flex-col gap-y-3"
    >
      <SidebarHeader>
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <CanvasSidebarContent />
      </SidebarContent>
    </Sidebar>
  );
}
