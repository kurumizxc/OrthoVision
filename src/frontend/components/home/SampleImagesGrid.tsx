"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useCallback, memo } from "react";
import {
  containerVariants,
  itemVariants,
  slideUpVariants,
} from "@/lib/animations";
import type { SampleImage } from "@/types/sampleImage";

interface SampleImagesGridProps {
  sampleImages: SampleImage[];
  selectedSampleId: number | null;
  onSelectSample: (sample: SampleImage) => void;
  isUploading?: boolean;
}

export const SampleImagesGrid = memo(SampleImagesGridComponent);

function SampleImagesGridComponent({
  sampleImages,
  selectedSampleId,
  onSelectSample,
  isUploading = false,
}: SampleImagesGridProps) {
  return (
    <motion.div
      className="py-0 my-3.5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p
        variants={itemVariants}
        className="text-sm text-gray-600 mb-3 text-center"
      >
        Or choose a sample image:
      </motion.p>
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="grid grid-cols-4 gap-3">
          {sampleImages.map((sample, index) => (
            <SampleImageButton
              key={sample.id}
              sample={sample}
              index={index}
              isSelected={selectedSampleId === sample.id}
              onSelect={onSelectSample}
              disabled={isUploading}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface SampleImageButtonProps {
  sample: SampleImage;
  index: number;
  isSelected: boolean;
  onSelect: (sample: SampleImage) => void;
  disabled?: boolean;
}

const SampleImageButton = memo(function SampleImageButton({
  sample,
  index,
  isSelected,
  onSelect,
  disabled = false,
}: SampleImageButtonProps) {
  // Select this sample when clicked
  const handleClick = useCallback(() => {
    if (disabled) return;
    onSelect(sample);
  }, [onSelect, sample, disabled]);

  return (
    <motion.button
      type="button"
      variants={slideUpVariants}
      custom={index}
      className={`relative overflow-hidden ${
        isSelected ? "ring-2 ring-blue-500 rounded-md" : ""
      } ${disabled ? "opacity-50 grayscale cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
      onClick={handleClick}
      aria-label={`Select sample image: ${sample.name}`}
      disabled={disabled}
    >
      <div className="w-16 h-16 bg-gray-200 overflow-hidden relative">
        <Image
          src={sample.url || "/placeholder.svg"}
          alt={sample.name}
          fill
          className="object-cover rounded-md"
          sizes="64px"
        />
      </div>
    </motion.button>
  );
});

/**
 * SampleImagesGrid renders a selectable grid of sample images
 * Allows users to quickly try the app without uploading a file
 */