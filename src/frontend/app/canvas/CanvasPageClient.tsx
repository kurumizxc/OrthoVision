"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CanvasEditor } from "@/components/canvasEditor"
import type { ImageData } from "@/types/image"

export default function CanvasPageClient() {
  const [image, setImage] = useState<ImageData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem("uploadedImage")
    if (stored) {
      setImage(JSON.parse(stored) as ImageData)
    } else {
      router.push("/")
    }
  }, [router])

  return image ? <CanvasEditor image={image} /> : <div>Loading...</div>
}
