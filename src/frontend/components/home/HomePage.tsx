"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { SAMPLE_IMAGES, type SampleImage } from "@/types/sampleImage";
import { useFileToBase64 } from "@/hooks/useFileReader";
import { PageHeader } from "./PageHeader";
import { UploadSection } from "./UploadSection";
import { InstructionsSection } from "./InstructionsSection";
import { AboutSection } from "./AboutSection";
import { AuthorsSection } from "./AuthorsSection";
import { SpecialThanksSection } from "./SpecialThanksSection";
import { Footer } from "@/components/home/Footer";

/**
 * HomePage is the main landing page component
 * Manages state for file uploads and sample selection
 */
export function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleImage | null>(
    null
  );
  const fileToBase64 = useFileToBase64();

  // Handle a newly accepted file: store, build preview, clear sample selection
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

  // Select a sample image and clear any uploaded file
  const handleSampleSelect = useCallback((sample: SampleImage) => {
    setSelectedSample(sample);
    setImagePreview(sample.url);
    setFile(null);
  }, []);

  // Remove current image selection and preview
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
            <UploadSection
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
            <InstructionsSection />
            <AboutSection />
            <AuthorsSection />
            <SpecialThanksSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/**
 * HomePage manages the landing experience: header, upload flow with preview,
 * optional sample selection, and informational sections with motion effects.
 */
