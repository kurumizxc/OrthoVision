"use client";

import Image from "next/image";
import type { ImageData } from "@/types/image";
import { motion } from "motion/react";
import {
  containerVariants,
  itemVariants,
  imageVariants,
} from "@/lib/animations";

interface SampleImage extends ImageData {
  id: number;
}

interface SampleImagesSectionProps {
  sampleImages: SampleImage[];
  selectedSampleId: number | null;
  onSelectSample: (sample: SampleImage) => void;
}

export function SampleImagesSection({
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
            <motion.button
              key={sample.id}
              type="button"
              variants={imageVariants}
              custom={index}
              className={`relative cursor-pointer overflow-hidden ${
                selectedSampleId === sample.id
                  ? "ring-2 ring-blue-500 rounded-md"
                  : ""
              }`}
              onClick={() => onSelectSample(sample)}
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
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
