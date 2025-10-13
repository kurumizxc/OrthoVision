"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
  const [isImageReady, setIsImageReady] = useState(false)
  const displayImageUrlRef = useRef<string>(image.url)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const updateCanvasState = useCallback((scale: number, position: { x: number; y: number }) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setStageScale(scale)
      setStagePosition(position)
    }, 150)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    setIsImageReady(false)

    const img = new Image()
    img.onload = () => {
      if (isMounted) {
        displayImageUrlRef.current = image.url
        setIsImageReady(true)
      }
    }
    img.onerror = () => {
      console.error("Failed to preload image")
      if (isMounted) {
        displayImageUrlRef.current = image.url
        setIsImageReady(true)
      }
    }
    img.src = image.url

    return () => {
      isMounted = false
    }
  }, [image.url])

  const detections = image.detectionResult?.detections || []
  const originalImageWidth = image.detectionResult?.imageWidth || 0
  const originalImageHeight = image.detectionResult?.imageHeight || 0

  const drawBoundingBoxes = (
    layer: Konva.Layer,
    boxes: BoundingBox[],
    imageNode: Konva.Image,
    scaleX: number,
    scaleY: number
  ) => {
    if (boxGroupRef.current) {
      boxGroupRef.current.destroy()
    }

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

      const rect = new Konva.Rect({
        x: x1 * scaleX,
        y: y1 * scaleY,
        width: boxWidth * scaleX,
        height: boxHeight * scaleY,
        stroke: "#00ff00",
        strokeWidth: 2,
        listening: false,
      })

      const text = new Konva.Text({
        text: detection.label,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#00ff00",
        listening: false,
      })

      const textHeight = text.height()
      text.x(x1 * scaleX)
      text.y(y1 * scaleY - textHeight - 4)

      boxGroup.add(rect)
      boxGroup.add(text)
    })

    layer.add(boxGroup)
    boxGroupRef.current = boxGroup
    layer.batchDraw()
  }

  useEffect(() => {
    // Wait for image URL to be ready before initializing canvas
    if (!containerRef.current || !isImageReady) return

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

    // Load and add image (image is preloaded, so this should be fast)
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
      imageLayer.batchDraw()

      // Draw bounding boxes after image layer completes rendering
      if (detections.length > 0 && originalImageWidth && originalImageHeight) {
        const scaleX = displayWidth / originalImageWidth
        const scaleY = displayHeight / originalImageHeight
        
        // Double RAF ensures image is fully painted before drawing boxes
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (boxLayerRef.current && imageNodeRef.current) {
              drawBoundingBoxes(boxLayer, detections, konvaImage, scaleX, scaleY)
            }
          })
        })
      }
    }
    
    imageObj.onerror = (error) => {
      console.error("Failed to load image into canvas:", error)
    }

    // Set source (image is already preloaded and cached)
    imageObj.src = displayImageUrlRef.current

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
      
      // Debounced state update - only updates sidebar after zoom ends
      updateCanvasState(clampedScale, newPos)
    })

    // Update position on drag
    stage.on("dragstart", () => {
      stage.container().style.cursor = "grabbing"
    })

    stage.on("dragend", () => {
      stage.container().style.cursor = "grab"
      // Update state immediately on drag end (natural stopping point)
      const finalScale = stage.scaleX()
      const finalPosition = stage.position()
      setStageScale(finalScale)
      setStagePosition(finalPosition)
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
  }, [isImageReady, detections, originalImageWidth, originalImageHeight, updateCanvasState])

  // Effect to toggle bounding box visibility
  useEffect(() => {
    if (boxLayerRef.current) {
      boxLayerRef.current.visible(showBoundingBoxes)
      boxLayerRef.current.batchDraw()
    }
  }, [showBoundingBoxes])

  const rotateImage = useCallback(() => {
    const imageNode = imageNodeRef.current
    const boxGroup = boxGroupRef.current
    if (!imageNode) return

    const newRotation = imageRotation + 90
    imageNode.rotation(newRotation)
    
    if (boxGroup) {
      boxGroup.rotation(newRotation)
    }
    
    setImageRotation(newRotation)
    imageLayerRef.current?.batchDraw()
    boxLayerRef.current?.batchDraw()
  }, [imageRotation])

  const resetView = useCallback(() => {
    const stage = stageRef.current
    const imageNode = imageNodeRef.current
    const boxGroup = boxGroupRef.current
    if (!stage || !imageNode) return

    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    setStageScale(1)
    setStagePosition({ x: 0, y: 0 })

    imageNode.rotation(0)
    if (boxGroup) {
      boxGroup.rotation(0)
    }
    setImageRotation(0)

    const containerWidth = stage.width()
    const containerHeight = stage.height()

    imageNode.position({
      x: containerWidth / 2,
      y: containerHeight / 2,
    })

    if (boxGroup) {
      boxGroup.position({
        x: containerWidth / 2,
        y: containerHeight / 2,
      })
    }

    imageLayerRef.current?.batchDraw()
    boxLayerRef.current?.batchDraw()
  }, [])

  const downloadCanvas = useCallback(() => {
    const stage = stageRef.current
    const imageNode = imageNodeRef.current
    
    if (!stage || !imageNode) return

    const imageBox = imageNode.getClientRect()

    const dataURL = stage.toDataURL({
      pixelRatio: 2,
      quality: 1.0,
      x: imageBox.x,
      y: imageBox.y,
      width: imageBox.width,
      height: imageBox.height,
    })

    const link = document.createElement("a")
    const className = image.detectionResult?.class?.replace(" ", "-") || "image"
    link.download = `Orthovision-${className}.png`
    link.href = dataURL
    link.click()
  }, [image.detectionResult?.class])

  const toggleBoundingBoxes = useCallback(() => {
    setShowBoundingBoxes((prev) => !prev)
  }, [])

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
          {!isImageReady ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading image...</p>
              </div>
            </div>
          ) : (
            <div ref={containerRef} className="w-full h-full bg-gray-100 dotted-grid-background" />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

