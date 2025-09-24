"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { UploadArea } from "@/components/uploadArea"
import { SampleImagesSection } from "@/components/sampleImages"
import type { ImageData } from "@/types/image"
import toast from "react-hot-toast"
import { motion } from "motion/react"
import { buttonVariants } from "@/lib/animations"

interface SampleImage extends ImageData {
  id: number
}

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

  const handleFileAccepted = useCallback(
    (file: File) => {
      setUploadedFile(file)
      setSelectedSample(null)
      onFileAccepted(file)
    },
    [onFileAccepted],
  )

  const handleSampleSelect = useCallback(
    (sample: SampleImage) => {
      setSelectedSample(sample)
      setUploadedFile(null)
      onSelectSample(sample)
    },
    [onSelectSample],
  )

  const processUpload = useCallback(async (): Promise<void> => {
    if (!currentImage) {
      throw new Error("Please select an image to upload.")
    }

    let imageData: ImageData

    if (uploadedFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onloadend = () => {
          try {
            imageData = {
              name: uploadedFile.name,
              size: uploadedFile.size,
              type: uploadedFile.type,
              url: reader.result as string,
            }
            sessionStorage.setItem("uploadedImage", JSON.stringify(imageData))
            setTimeout(() => {
              router.push("/canvas")
              resolve()
            }, 500)
          } catch (error) {
            reject(new Error("Failed to process image file."))
          }
        }

        reader.onerror = () => {
          reject(new Error("Failed to read image file."))
        }

        reader.readAsDataURL(uploadedFile)
      })
    } else if (selectedSample) {
      return new Promise((resolve, reject) => {
        try {
          imageData = {
            name: selectedSample.name,
            size: selectedSample.size,
            type: selectedSample.type,
            url: selectedSample.url,
          }
          sessionStorage.setItem("uploadedImage", JSON.stringify(imageData))
          setTimeout(() => {
            router.push("/canvas")
            resolve()
          }, 300)
        } catch (error) {
          reject(new Error("Failed to process sample image."))
        }
      })
    } else {
      throw new Error("No image selected.")
    }
  }, [currentImage, uploadedFile, selectedSample, router])

  const handleSubmit = useCallback(async () => {
    if (!currentImage) {
      toast.error("Please select an image to upload.")
      return
    }

    setIsUploading(true)

    const uploadPromise = processUpload()

    toast.promise(uploadPromise, {
      loading: "Uploading image...",
      success: "Image uploaded successfully!",
      error: (err) => err.message || "Upload failed. Please try again.",
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
