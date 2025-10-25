"use client"

import React, { createContext, useContext } from "react"
import type { ImageDataWithResult } from "@/types/image"

/**
 * CanvasContext provides image data, view state (zoom/rotation/pan),
 * detection visibility, and related actions to canvas UI consumers.
 */

export interface CanvasContextValue {
  image: ImageDataWithResult
  imageRotation: number
  stageScale: number
  stagePosition: { x: number; y: number }
  rotateImage: () => void
  resetView: () => void
  downloadCanvas: () => void
  showBoundingBoxes: boolean
  toggleBoundingBoxes: () => void
}

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined)

/**
 * Hook to access the CanvasContext.
 * Throws if used outside of the CanvasProvider to prevent misuse.
 */
export function useCanvas(): CanvasContextValue {
  const ctx = useContext(CanvasContext)
  if (!ctx) throw new Error("useCanvas must be used within a CanvasContext.Provider")
  return ctx
}

export const CanvasProvider = CanvasContext.Provider

export default CanvasContext

/**
 * Summary
 * CanvasContext and related hook/provider definitions for sharing canvas state
 * and actions (zoom/rotation/pan, detection visibility, export) across the app.
 */
