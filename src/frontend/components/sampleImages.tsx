"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { memo, useCallback } from "react";
import {
  containerVariants,
  itemVariants,
  imageVariants,
} from "@/lib/animations";
import type { SampleImage } from "@/types/sampleImage";

interface SampleImagesSectionProps {
  sampleImages: SampleImage[];
  selectedSampleId: number | null;
  onSelectSample: (sample: SampleImage) => void;
}

export const SampleImagesSection = memo(function SampleImagesSection({
  sampleImages,
  selectedSampleId,
  onSelectSample,
}: SampleImagesSectionProps) {
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
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
});

const SampleImageButton = memo(function SampleImageButton({
  sample,
  index,
  isSelected,
  onSelect,
}: {
  sample: SampleImage;
  index: number;
  isSelected: boolean;
  onSelect: (sample: SampleImage) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(sample);
  }, [onSelect, sample]);

  return (
    <motion.button
      type="button"
      variants={imageVariants}
      custom={index}
      className={`relative cursor-pointer overflow-hidden ${
        isSelected ? "ring-2 ring-blue-500 rounded-md" : ""
      }`}
      onClick={handleClick}
      aria-label={`Select sample image: ${sample.name}`}
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
