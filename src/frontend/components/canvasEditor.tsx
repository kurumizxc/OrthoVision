"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import Konva from "konva"
import { CanvasSidebar } from "./canvasSidebar"
import { Separator } from "@/components/ui/separator"
import type { ImageDataWithResult, BoundingBox } from "@/types/image"

interface CanvasEditorProps {
  image: ImageDataWithResult
}

export function CanvasEditor({ image }: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const imageLayerRef = useRef<Konva.Layer | null>(null)
  const boxLayerRef = useRef<Konva.Layer | null>(null)
  const imageNodeRef = useRef<Konva.Image | null>(null)
  const boxGroupRef = useRef<Konva.Group | null>(null)
  const [imageRotation, setImageRotation] = useState(0)
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const [initialImageSize, setInitialImageSize] = useState({ width: 0, height: 0 })
  const router = useRouter()

  // Always use the original uploaded image
  const displayImageUrl = image.url
  const detections = image.detectionResult?.detections || []
  const originalImageWidth = image.detectionResult?.imageWidth || 0
  const originalImageHeight = image.detectionResult?.imageHeight || 0

  // Function to draw bounding boxes on the canvas
  const drawBoundingBoxes = (
    layer: Konva.Layer,
    boxes: BoundingBox[],
    imageNode: Konva.Image,
    scaleX: number,
    scaleY: number
  ) => {
    // Remove existing box group if any
    if (boxGroupRef.current) {
      boxGroupRef.current.destroy()
    }

    // Create a group for all bounding boxes (attached to image position)
    const boxGroup = new Konva.Group({
      x: imageNode.x(),
      y: imageNode.y(),
      rotation: imageNode.rotation(),
      offsetX: imageNode.offsetX(),
      offsetY: imageNode.offsetY(),
    })

    boxes.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.box
      const boxWidth = x2 - x1
      const boxHeight = y2 - y1

      // Draw rectangle
      const rect = new Konva.Rect({
        x: x1 * scaleX,
        y: y1 * scaleY,
        width: boxWidth * scaleX,
        height: boxHeight * scaleY,
        stroke: "#00ff00",
        strokeWidth: 2,
        listening: false,
      })

      // Draw label background
      const labelText = detection.label
      const fontSize = 14
      const padding = 4

      // Create text to measure its size
      const text = new Konva.Text({
        text: labelText,
        fontSize: fontSize,
        fontFamily: "Arial",
        fill: "#000000",
        listening: false,
      })

      const textWidth = text.width()
      const textHeight = text.height()

      // Position label above the box
      const labelX = x1 * scaleX
      const labelY = y1 * scaleY - textHeight - padding * 2 - 4

      const labelBg = new Konva.Rect({
        x: labelX,
        y: labelY,
        width: textWidth + padding * 2,
        height: textHeight + padding * 2,
        fill: "#00ff00",
        cornerRadius: 3,
        listening: false,
      })

      text.x(labelX + padding)
      text.y(labelY + padding)

      // Add to group
      boxGroup.add(rect)
      boxGroup.add(labelBg)
      boxGroup.add(text)
    })

    layer.add(boxGroup)
    boxGroupRef.current = boxGroup
    layer.batchDraw()
  }

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

    // Create layers
    const imageLayer = new Konva.Layer()
    const boxLayer = new Konva.Layer()
    stage.add(imageLayer)
    stage.add(boxLayer)

    // Store references
    stageRef.current = stage
    imageLayerRef.current = imageLayer
    boxLayerRef.current = boxLayer

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

      // Store initial display size for bounding box scaling
      setInitialImageSize({ width: displayWidth, height: displayHeight })

      const konvaImage = new Konva.Image({
        x: containerWidth / 2,
        y: containerHeight / 2,
        image: imageObj,
        width: displayWidth,
        height: displayHeight,
        // Set offset to center for proper rotation
        offsetX: displayWidth / 2,
        offsetY: displayHeight / 2,
      })

      imageLayer.add(konvaImage)
      imageNodeRef.current = konvaImage
      imageLayer.draw()

      // Draw bounding boxes if detections exist
      if (detections.length > 0 && originalImageWidth && originalImageHeight) {
        const scaleX = displayWidth / originalImageWidth
        const scaleY = displayHeight / originalImageHeight
        drawBoundingBoxes(boxLayer, detections, konvaImage, scaleX, scaleY)
      }
    }

    imageObj.src = displayImageUrl

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
    stage.on("dragstart", () => {
      stage.container().style.cursor = "grabbing"
    })

    stage.on("dragend", () => {
      stage.container().style.cursor = "grab"
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
  }, [displayImageUrl, detections, originalImageWidth, originalImageHeight])

  // Effect to toggle bounding box visibility
  useEffect(() => {
    if (boxLayerRef.current) {
      boxLayerRef.current.visible(showBoundingBoxes)
      boxLayerRef.current.batchDraw()
    }
  }, [showBoundingBoxes])

  const rotateImage = () => {
    const imageNode = imageNodeRef.current
    const boxGroup = boxGroupRef.current
    if (!imageNode) return

    const newRotation = imageRotation + 90
    imageNode.rotation(newRotation)
    
    // Also rotate the bounding box group
    if (boxGroup) {
      boxGroup.rotation(newRotation)
    }
    
    setImageRotation(newRotation)
    imageLayerRef.current?.batchDraw()
    boxLayerRef.current?.batchDraw()
  }

  const resetView = () => {
    const stage = stageRef.current
    const imageNode = imageNodeRef.current
    const boxGroup = boxGroupRef.current
    if (!stage || !imageNode) return

    // Reset stage
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    setStageScale(1)
    setStagePosition({ x: 0, y: 0 })

    // Reset image rotation
    imageNode.rotation(0)
    if (boxGroup) {
      boxGroup.rotation(0)
    }
    setImageRotation(0)

    // Center image (it's already centered from initialization)
    const containerWidth = stage.width()
    const containerHeight = stage.height()

    imageNode.position({
      x: containerWidth / 2,
      y: containerHeight / 2,
    })

    // Update box group position if it exists
    if (boxGroup) {
      boxGroup.position({
        x: containerWidth / 2,
        y: containerHeight / 2,
      })
    }

    imageLayerRef.current?.batchDraw()
    boxLayerRef.current?.batchDraw()
  }

  const downloadCanvas = () => {
    const stage = stageRef.current
    const imageNode = imageNodeRef.current
    
    if (!stage || !imageNode) return

    // Get the bounding box of the image to determine export area
    const imageBox = imageNode.getClientRect()

    // Export only the area containing the image (and boxes if visible)
    const dataURL = stage.toDataURL({
      pixelRatio: 2,
      quality: 1.0,
      x: imageBox.x,
      y: imageBox.y,
      width: imageBox.width,
      height: imageBox.height,
    })

    // Download
    const link = document.createElement("a")
    const className = image.detectionResult?.class?.replace(" ", "-") || "image"
    link.download = `Orthovision-${className}.png`
    link.href = dataURL
    link.click()
  }

  const toggleBoundingBoxes = () => {
    setShowBoundingBoxes(!showBoundingBoxes)
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
        showBoundingBoxes={showBoundingBoxes}
        toggleBoundingBoxes={toggleBoundingBoxes}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg text-gray-900 font-black">OrthoVision</h1>
        </header>
        <div className="flex-1 flex bg-opacity-50 shadow-inner cursor-grab active:cursor-grabbing overflow-hidden">
          <div ref={containerRef} className="w-full h-full bg-gray-100 dotted-grid-background" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
