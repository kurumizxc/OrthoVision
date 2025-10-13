"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { UploadArea } from "@/components/uploadArea"
import { SampleImagesSection } from "@/components/sampleImages"
import type { ImageData, ImageDataWithResult } from "@/types/image"
import type { SampleImage } from "@/types/sampleImage"
import toast from "react-hot-toast"
import { motion } from "motion/react"
import { buttonVariants } from "@/lib/animations"
import { detectFracture } from "@/lib/api"
import { useFileToBase64 } from "@/hooks/useFileReader"

interface UploadMainSectionProps {
  imagePreview: string | null
  currentImage: { name: string; size: number } | null
  removeFile: () => void
  onFileAccepted: (file: File) => void
  onSelectSample: (sample: SampleImage) => void
  sampleImages: SampleImage[]
}

export function UploadMainSection({
  imagePreview,
  currentImage,
  removeFile,
  onFileAccepted,
  onSelectSample,
  sampleImages,
}: UploadMainSectionProps) {
  const [selectedSample, setSelectedSample] = useState<SampleImage | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const fileToBase64 = useFileToBase64()

  const handleFileAccepted = useCallback(
    (file: File) => {
      setUploadedFile(file)
      setSelectedSample(null)
      onFileAccepted(file)
    },
    [onFileAccepted]
  )

  const handleSampleSelect = useCallback(
    (sample: SampleImage) => {
      setSelectedSample(sample)
      setUploadedFile(null)
      onSelectSample(sample)
    },
    [onSelectSample]
  )

  const processUpload = useCallback(
    async (): Promise<void> => {
      if (!currentImage) {
        throw new Error("Please select an image to upload.")
      }

      const imageData: ImageData = uploadedFile
        ? {
            name: uploadedFile.name,
            size: uploadedFile.size,
            type: uploadedFile.type,
            url: await fileToBase64(uploadedFile),
          }
        : selectedSample
        ? {
            name: selectedSample.name,
            size: selectedSample.size,
            type: selectedSample.type,
            url: selectedSample.url,
          }
        : (() => {
            throw new Error("No image selected.")
          })()

      const detectionResult = await detectFracture(uploadedFile || imageData.url)

      const imageDataWithResult: ImageDataWithResult = {
        ...imageData,
        detectionResult,
      }

      sessionStorage.setItem("uploadedImage", JSON.stringify(imageDataWithResult))

      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/canvas")
    },
    [currentImage, uploadedFile, selectedSample, router, fileToBase64]
  )

  const handleSubmit = useCallback(async () => {
    if (!currentImage) {
      toast.error("Please select an image to upload.")
      return
    }

    setIsUploading(true)

    const uploadPromise = processUpload()

    toast.promise(uploadPromise, {
      loading: "Analyzing image...",
      success: "Analysis complete!",
      error: (err) => err.message || "Analysis failed. Please try again.",
    })

    try {
      await uploadPromise
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }, [currentImage, processUpload])

  return (
    <>
      <UploadArea
        imagePreview={imagePreview}
        currentImage={currentImage}
        removeFile={removeFile}
        onFileAccepted={handleFileAccepted}
      />

      <SampleImagesSection
        sampleImages={sampleImages}
        selectedSampleId={selectedSample?.id || null}
        onSelectSample={handleSampleSelect}
      />

      <motion.div className="flex justify-center" variants={buttonVariants} initial="hidden" animate="visible">
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={!currentImage || isUploading}
          className="transition-all duration-200 hover:scale-105"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      </motion.div>
    </>
  )
}
