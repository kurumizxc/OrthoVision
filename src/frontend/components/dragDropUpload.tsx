"use client";

import { useState, useCallback, memo } from "react";
import { UploadMainSection } from "@/components/uploadMain";
import {
  AnimatedInstructions,
  AnimatedAbout,
  AnimatedAuthors,
  AnimatedSpecialThanks,
} from "@/components/animatedSections";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { SAMPLE_IMAGES, type SampleImage } from "@/types/sampleImage";
import { useFileToBase64 } from "@/hooks/useFileReader";

const PageHeader = memo(function PageHeader() {
  return (
    <motion.header variants={itemVariants} className="text-center">
      <h1 className="text-3xl text-gray-900 mb-0 font-black">OrthoVision</h1>
      <p className="text-gray-600">
        AI-Powered Fracture Detection & Classification
      </p>
    </motion.header>
  );
});

export default function DragDropUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleImage | null>(
    null
  );
  const fileToBase64 = useFileToBase64();

  const handleFileAccepted = useCallback(
    async (acceptedFile: File) => {
      setFile(acceptedFile);

      try {
        const base64 = await fileToBase64(acceptedFile);
        setImagePreview(base64);
      } catch (error) {
        console.error("Failed to read file:", error);
      }

      setSelectedSample(null);
    },
    [fileToBase64]
  );

  const handleSampleSelect = useCallback((sample: SampleImage) => {
    setSelectedSample(sample);
    setImagePreview(sample.url);
    setFile(null);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setImagePreview(null);
    setSelectedSample(null);
  }, []);

  const currentImage = file || selectedSample;

  return (
    <div className="drag-drop-background">
      <main>
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="min-h-screen flex flex-col items-center justify-center space-y-4"
        >
          <PageHeader />

          <motion.div variants={itemVariants} className="max-w-xl w-full">
            <UploadMainSection
              imagePreview={imagePreview}
              currentImage={currentImage}
              removeFile={removeFile}
              onFileAccepted={handleFileAccepted}
              onSelectSample={handleSampleSelect}
              sampleImages={SAMPLE_IMAGES}
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
  );
}
