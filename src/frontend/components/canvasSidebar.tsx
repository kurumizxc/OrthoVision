"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar"
import { CanvasSidebarContent } from "./canvasSidebarContent"
import type { ImageData } from "@/types/image"

interface CanvasSidebarProps {
  image: ImageData
  imageRotation: number
  stageScale: number
  stagePosition: { x: number; y: number }
  rotateImage: () => void
  resetView: () => void
  downloadCanvas: () => void
}

export function CanvasSidebar({
  image,
  imageRotation,
  stageScale,
  stagePosition,
  rotateImage,
  resetView,
  downloadCanvas,
}: CanvasSidebarProps) {
  const router = useRouter()

  return (
    <Sidebar side="left" mobileSide="top" collapsible="offcanvas" className="flex-col gap-y-3">
      <SidebarHeader>
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <CanvasSidebarContent
          image={image}
          imageRotation={imageRotation}
          stageScale={stageScale}
          stagePosition={stagePosition}
          rotateImage={rotateImage}
          resetView={resetView}
          downloadCanvas={downloadCanvas}
        />
      </SidebarContent>
    </Sidebar>
  )
}
