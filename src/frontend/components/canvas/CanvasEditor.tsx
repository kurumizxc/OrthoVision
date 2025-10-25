"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import Konva from "konva";
import { CanvasSidebar } from "./CanvasSidebar";
import { Separator } from "@/components/ui/separator";
import type { ImageDataWithResult, BoundingBox } from "@/types/image";
import { CanvasProvider } from "./CanvasContext";

/**
 * CanvasEditor - Interactive canvas for viewing X-ray images with detection overlays
 * Provides zoom, pan, rotate, and download functionality
 */

interface CanvasEditorProps {
  image: ImageDataWithResult;
}

export function CanvasEditor({ image }: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const imageLayerRef = useRef<Konva.Layer | null>(null);
  const boxLayerRef = useRef<Konva.Layer | null>(null);
  const imageNodeRef = useRef<Konva.Image | null>(null);
  const boxGroupRef = useRef<Konva.Group | null>(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [isImageReady, setIsImageReady] = useState(false);
  const displayImageUrlRef = useRef<string>(image.url);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced setter for stage scale and position to avoid excessive re-renders during zoom/pan
  const updateCanvasState = useCallback(
    (scale: number, position: { x: number; y: number }) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer to update state after 150ms
      debounceTimerRef.current = setTimeout(() => {
        setStageScale(scale);
        setStagePosition(position);
      }, 150);
    },
    []
  );

  // Cleanup any pending debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Preload the image URL and only render the canvas once the image is ready
   */
  useEffect(() => {
    let isMounted = true;
    setIsImageReady(false);

    const img = new Image();
    img.onload = () => {
      if (isMounted) {
        displayImageUrlRef.current = image.url;
        setIsImageReady(true);
      }
    };
    img.onerror = () => {
      console.error("Failed to preload image");
      if (isMounted) {
        displayImageUrlRef.current = image.url;
        setIsImageReady(true);
      }
    };
    img.src = image.url;

    return () => {
      isMounted = false;
    };
  }, [image.url]);

  const detections = image.detectionResult?.detections || [];
  const originalImageWidth = image.detectionResult?.imageWidth || 0;
  const originalImageHeight = image.detectionResult?.imageHeight || 0;

  /**
   * Draw bounding boxes and labels over the displayed image.
   * The boxes are placed within a group that mirrors the image node's transform
   * so that rotation and positioning stay in sync.
   *
   * @param layer Konva layer to draw the boxes on
   * @param boxes Array of detections with bounding boxes and labels
   * @param imageNode Konva image node to align the overlay with
   * @param scaleX Scale factor from original image width to displayed width
   * @param scaleY Scale factor from original image height to displayed height
   */
  const drawBoundingBoxes = (
    layer: Konva.Layer,
    boxes: BoundingBox[],
    imageNode: Konva.Image,
    scaleX: number,
    scaleY: number
  ) => {
    if (boxGroupRef.current) {
      boxGroupRef.current.destroy();
    }

    const boxGroup = new Konva.Group({
      x: imageNode.x(),
      y: imageNode.y(),
      rotation: imageNode.rotation(),
      offsetX: imageNode.offsetX(),
      offsetY: imageNode.offsetY(),
    });

    boxes.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.box;
      const boxWidth = x2 - x1;
      const boxHeight = y2 - y1;

      const rect = new Konva.Rect({
        x: x1 * scaleX,
        y: y1 * scaleY,
        width: boxWidth * scaleX,
        height: boxHeight * scaleY,
        stroke: "#00ff00",
        strokeWidth: 2,
        listening: false,
      });

      const text = new Konva.Text({
        text: detection.label,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#00ff00",
        listening: false,
      });

      const textHeight = text.height();
      text.x(x1 * scaleX);
      text.y(y1 * scaleY - textHeight - 4);

      boxGroup.add(rect);
      boxGroup.add(text);
    });

    layer.add(boxGroup);
    boxGroupRef.current = boxGroup;
    layer.batchDraw();
  };

  /**
   * Initialize the Konva stage and layers, render the image, attach zoom/pan handlers,
   * and draw detection overlays. Cleans up listeners and destroys the stage on unmount
   * or when dependencies change.
   */
  useEffect(() => {
    if (!containerRef.current || !isImageReady) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const stage = new Konva.Stage({
      container: container,
      width: containerWidth,
      height: containerHeight,
      draggable: true,
    });

    stage.container().style.cursor = "grab";

    const imageLayer = new Konva.Layer();
    const boxLayer = new Konva.Layer();
    stage.add(imageLayer);
    stage.add(boxLayer);

    stageRef.current = stage;
    imageLayerRef.current = imageLayer;
    boxLayerRef.current = boxLayer;

    const imageObj = new Image();
    imageObj.crossOrigin = "anonymous";

    imageObj.onload = () => {
      const maxWidth = containerWidth * 0.8;
      const maxHeight = containerHeight * 0.8;
      const imageAspect = imageObj.width / imageObj.height;
      const containerAspect = maxWidth / maxHeight;

      let displayWidth, displayHeight;

      if (imageAspect > containerAspect) {
        displayWidth = maxWidth;
        displayHeight = maxWidth / imageAspect;
      } else {
        displayHeight = maxHeight;
        displayWidth = maxHeight * imageAspect;
      }

      const konvaImage = new Konva.Image({
        x: containerWidth / 2,
        y: containerHeight / 2,
        image: imageObj,
        width: displayWidth,
        height: displayHeight,
        offsetX: displayWidth / 2,
        offsetY: displayHeight / 2,
      });

      imageLayer.add(konvaImage);
      imageNodeRef.current = konvaImage;
      imageLayer.batchDraw();

      if (detections.length > 0 && originalImageWidth && originalImageHeight) {
        const scaleX = displayWidth / originalImageWidth;
        const scaleY = displayHeight / originalImageHeight;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (boxLayerRef.current && imageNodeRef.current) {
              drawBoundingBoxes(boxLayer, detections, konvaImage, scaleX, scaleY);
            }
          });
        });
      }
    };

    imageObj.onerror = (error) => {
      console.error("Failed to load image into canvas:", error);
    };

    imageObj.src = displayImageUrlRef.current;

    stage.on("wheel", (e) => {
      e.evt.preventDefault();

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const scaleBy = 1.05;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));

      stage.scale({ x: clampedScale, y: clampedScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };

      stage.position(newPos);
      updateCanvasState(clampedScale, newPos);
    });

    stage.on("dragstart", () => {
      stage.container().style.cursor = "grabbing";
    });

    stage.on("dragend", () => {
      stage.container().style.cursor = "grab";
      const finalScale = stage.scaleX();
      const finalPosition = stage.position();
      setStageScale(finalScale);
      setStagePosition(finalPosition);
    });

    const handleResize = () => {
      const newWidth = container.offsetWidth;
      const newHeight = container.offsetHeight;
      stage.width(newWidth);
      stage.height(newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      stage.destroy();
    };
  }, [
    isImageReady,
    detections,
    originalImageWidth,
    originalImageHeight,
    updateCanvasState,
  ]);

  // Show/hide the bounding box overlay layer when toggled
  useEffect(() => {
    if (boxLayerRef.current) {
      boxLayerRef.current.visible(showBoundingBoxes);
      boxLayerRef.current.batchDraw();
    }
  }, [showBoundingBoxes]);

  /**
   * Rotate the image (and overlay group, if present) by +90 degrees each time.
   * Keeps the rotation state in sync and requests layer redraws.
   */
  const rotateImage = useCallback(() => {
    const imageNode = imageNodeRef.current;
    const boxGroup = boxGroupRef.current;
    if (!imageNode) return;

    const newRotation = imageRotation + 90;
    imageNode.rotation(newRotation);

    if (boxGroup) {
      boxGroup.rotation(newRotation);
    }

    setImageRotation(newRotation);
    imageLayerRef.current?.batchDraw();
    boxLayerRef.current?.batchDraw();
  }, [imageRotation]);

  /**
   * Reset the canvas view to defaults: no zoom/pan, no rotation,
   * and recenter the image (and overlay group) within the container.
   */
  const resetView = useCallback(() => {
    const stage = stageRef.current;
    const imageNode = imageNodeRef.current;
    const boxGroup = boxGroupRef.current;
    if (!stage || !imageNode) return;

    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });

    imageNode.rotation(0);
    if (boxGroup) {
      boxGroup.rotation(0);
    }
    setImageRotation(0);

    const containerWidth = stage.width();
    const containerHeight = stage.height();

    imageNode.position({
      x: containerWidth / 2,
      y: containerHeight / 2,
    });

    if (boxGroup) {
      boxGroup.position({
        x: containerWidth / 2,
        y: containerHeight / 2,
      });
    }

    imageLayerRef.current?.batchDraw();
    boxLayerRef.current?.batchDraw();
  }, []);

  /**
   * Export the currently visible image region (matching the image bounds) as a PNG
   * and trigger a client-side download with a descriptive filename.
   */
  const downloadCanvas = useCallback(() => {
    const stage = stageRef.current;
    const imageNode = imageNodeRef.current;

    if (!stage || !imageNode) return;

    const imageBox = imageNode.getClientRect();

    const dataURL = stage.toDataURL({
      pixelRatio: 2,
      quality: 1.0,
      x: imageBox.x,
      y: imageBox.y,
      width: imageBox.width,
      height: imageBox.height,
    });

    const link = document.createElement("a");
    const className =
      image.detectionResult?.class?.replace(" ", "-") || "image";
    link.download = `Orthovision-${className}.png`;
    link.href = dataURL;
    link.click();
  }, [image.detectionResult?.class]);

  // Toggle the visibility of bounding boxes
  const toggleBoundingBoxes = useCallback(() => {
    setShowBoundingBoxes((prev) => !prev);
  }, []);

  return (
    <div className="h-screen w-full flex">
      <SidebarProvider>
        <CanvasProvider
          value={{
            image,
            imageRotation,
            stageScale,
            stagePosition,
            rotateImage,
            resetView,
            downloadCanvas,
            showBoundingBoxes,
            toggleBoundingBoxes,
          }}
        >
          <CanvasSidebar />
          <SidebarInset className="flex flex-col">
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
                <div
                  ref={containerRef}
                  className="w-full h-full bg-gray-100 dotted-grid-background"
                />
              )}
            </div>
          </SidebarInset>
        </CanvasProvider>
      </SidebarProvider>
    </div>
  );
}

/**
 * Summary
 * CanvasEditor renders an interactive Konva-powered canvas to view X-ray images.
 * It supports:
 * - Zooming and panning with mouse wheel and drag
 * - Rotating the image in 90° increments and resetting the view
 * - Drawing and toggling detection bounding boxes aligned to the image
 * - Exporting the visible image region as a PNG
 * - Responsive resizing and debounced state updates for smooth UX
 *
 * The component exposes controls via CanvasProvider for sidebar actions.
 */
