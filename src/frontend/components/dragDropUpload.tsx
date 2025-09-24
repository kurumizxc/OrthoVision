"use client"

import { useState, useEffect } from "react"
import { UploadMainSection } from "@/components/uploadMain"
import {
  AnimatedInstructions,
  AnimatedAbout,
  AnimatedAuthors,
  AnimatedSpecialThanks,
} from "@/components/animatedSections"
import { Footer } from "@/components/footer"
import type { ImageData } from "@/types/image"
import { motion } from "motion/react"
import { containerVariants, itemVariants } from "@/lib/animations"

interface SampleImage extends ImageData {
  id: number
}

const sampleImages: SampleImage[] = [
  {
    id: 1,
    name: "sample-xray-1.jpeg",
    url: "/images/sample-xray-1.jpeg",
    size: 716800,
    type: "image/jpeg",
  },
  {
    id: 2,
    name: "sample-xray-2.jpeg",
    url: "/images/sample-xray-2.jpeg",
    size: 307200,
    type: "image/jpeg",
  },
  {
    id: 3,
    name: "sample-xray-3.jpeg",
    url: "/images/sample-xray-3.jpeg",
    size: 307200,
    type: "image/jpeg",
  },
  {
    id: 4,
    name: "sample-xray-4.jpeg",
    url: "/images/sample-xray-4.jpeg",
    size: 307200,
    type: "image/jpeg",
  },
]

export default function DragDropUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedSample, setSelectedSample] = useState<SampleImage | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleFileAccepted = (acceptedFile: File) => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }

    setFile(acceptedFile)
    setImagePreview(URL.createObjectURL(acceptedFile))
    setSelectedSample(null)
  }

  const handleSampleSelect = (sample: SampleImage) => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }

    setSelectedSample(sample)
    setImagePreview(sample.url)
    setFile(null)
  }

  const removeFile = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }

    setFile(null)
    setImagePreview(null)
    setSelectedSample(null)
  }

  const currentImage = file || selectedSample

  return (
    <div className="drag-drop-background">
      <main>
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="min-h-screen flex flex-col items-center justify-center space-y-4"
        >
          <motion.header variants={itemVariants} className="text-center">
            <h1 className="text-3xl text-gray-900 mb-0 font-black">OrthoVision</h1>
            <p className="text-gray-600">AI-Powered Fracture Detection & Classification</p>
          </motion.header>

          <motion.div variants={itemVariants} className="max-w-xl w-full">
            <UploadMainSection
              imagePreview={imagePreview}
              currentImage={currentImage}
              removeFile={removeFile}
              onFileAccepted={handleFileAccepted}
              onSelectSample={handleSampleSelect}
              sampleImages={sampleImages}
            />
          </motion.div>
        </motion.section>

        <section className="min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col max-w-xl w-full">
            <AnimatedInstructions />
            <AnimatedAbout />
            <AnimatedAuthors />
            <AnimatedSpecialThanks />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
