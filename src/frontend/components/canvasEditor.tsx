"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import Konva from "konva"
import { CanvasSidebar } from "./canvasSidebar"
import { Separator } from "@/components/ui/separator"
import type { ImageData } from "@/types/image"

interface CanvasEditorProps {
  image: ImageData
}

export function CanvasEditor({ image }: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const layerRef = useRef<Konva.Layer | null>(null)
  const imageNodeRef = useRef<Konva.Image | null>(null)
  const [imageRotation, setImageRotation] = useState(0)
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    // Create stage
    const stage = new Konva.Stage({
      container: container,
      width: containerWidth,
      height: containerHeight,
      draggable: true,
    })

    // Set default cursor to grab
    stage.container().style.cursor = "grab"

    // Create layer
    const layer = new Konva.Layer()
    stage.add(layer)

    // Store references
    stageRef.current = stage
    layerRef.current = layer

    // Load and add image
    const imageObj = new Image()
    imageObj.crossOrigin = "anonymous"
    imageObj.onload = () => {
      // Calculate scale to fit image in viewport while maintaining aspect ratio
      const maxWidth = containerWidth * 0.8
      const maxHeight = containerHeight * 0.8
      const imageAspect = imageObj.width / imageObj.height
      const containerAspect = maxWidth / maxHeight

      let displayWidth, displayHeight

      if (imageAspect > containerAspect) {
        displayWidth = maxWidth
        displayHeight = maxWidth / imageAspect
      } else {
        displayHeight = maxHeight
        displayWidth = maxHeight * imageAspect
      }

      const konvaImage = new Konva.Image({
        x: (containerWidth - displayWidth) / 2,
        y: (containerHeight - displayHeight) / 2,
        image: imageObj,
        width: displayWidth,
        height: displayHeight,
        draggable: true,
        // Set offset to center for proper rotation
        offsetX: displayWidth / 2,
        offsetY: displayHeight / 2,
      })

      // Adjust position to account for offset
      konvaImage.x(containerWidth / 2)
      konvaImage.y(containerHeight / 2)

      // Add selection border
      konvaImage.on("mouseenter", () => {
        stage.container().style.cursor = "grab"
      })

      konvaImage.on("mouseleave", () => {
        stage.container().style.cursor = "grab"
      })

      konvaImage.on("dragstart", () => {
        stage.container().style.cursor = "grabbing"
      })

      konvaImage.on("dragend", () => {
        stage.container().style.cursor = "grab"
      })

      layer.add(konvaImage)
      imageNodeRef.current = konvaImage
      layer.draw()
    }

    imageObj.src = image.url

    // Add wheel zoom functionality
    stage.on("wheel", (e) => {
      e.evt.preventDefault()

      const oldScale = stage.scaleX()
      const pointer = stage.getPointerPosition()

      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }

      const direction = e.evt.deltaY > 0 ? -1 : 1

      // Zoom limits
      const scaleBy = 1.05
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
      const clampedScale = Math.max(0.1, Math.min(5, newScale))

      stage.scale({ x: clampedScale, y: clampedScale })

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      }

      stage.position(newPos)
      setStageScale(clampedScale)
      setStagePosition(newPos)
    })

    // Update position on drag
    stage.on("dragend", () => {
      setStagePosition(stage.position())
    })

    // Handle resize
    const handleResize = () => {
      const newWidth = container.offsetWidth
      const newHeight = container.offsetHeight
      stage.width(newWidth)
      stage.height(newHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      stage.destroy()
    }
  }, [image])

  const rotateImage = () => {
    const imageNode = imageNodeRef.current
    if (!imageNode) return

    const newRotation = imageRotation + 90
    imageNode.rotation(newRotation)
    setImageRotation(newRotation)
    layerRef.current?.draw()
  }

  const resetView = () => {
    const stage = stageRef.current
    const imageNode = imageNodeRef.current
    if (!stage || !imageNode) return

    // Reset stage
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    setStageScale(1)
    setStagePosition({ x: 0, y: 0 })

    // Reset image rotation
    imageNode.rotation(0)
    setImageRotation(0)

    // Center image
    const containerWidth = stage.width()
    const containerHeight = stage.height()

    imageNode.position({
      x: containerWidth / 2,
      y: containerHeight / 2,
    })

    layerRef.current?.draw()
  }

  const downloadCanvas = () => {
    const stage = stageRef.current
    const imageNode = imageNodeRef.current
    if (!stage || !imageNode) return

    const dataURL = imageNode.toDataURL({
      pixelRatio: 2,
      // Ensure we get the full quality of the image
      quality: 1.0,
    })

    const link = document.createElement("a")
    link.download = "canvas-export.png"
    link.href = dataURL
    link.click()
  }

  return (
    <SidebarProvider>
      <CanvasSidebar
        image={image}
        imageRotation={imageRotation}
        stageScale={stageScale}
        stagePosition={stagePosition}
        rotateImage={rotateImage}
        resetView={resetView}
        downloadCanvas={downloadCanvas}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg text-gray-900 font-black">OrthoVision</h1> {/* Corrected h1 tag */}
        </header>
        <div className="flex-1 flex bg-opacity-50 shadow-inner cursor-grab active:cursor-grabbing overflow-hidden">
          <div ref={containerRef} className="w-full h-full bg-gray-100 dotted-grid-background" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
