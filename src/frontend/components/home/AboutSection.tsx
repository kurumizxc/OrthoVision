"use client";

import { motion } from "motion/react";
import { itemVariants, sectionMotionProps } from "@/lib/animations";

/**
 * About section describing the application
 */
export function AboutSection() {
  return (
    <motion.section
      className="rounded-lg p-6 bg-transparent shadow-none py-6"
      {...sectionMotionProps}
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-gray-900 mb-2 font-black text-3xl">About OrthoVision</h2>
      </motion.div>
      <div>
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 mb-4 text-justify text-sm">
            Advanced AI medical imaging tool developed at West Visayas State
            University for orthopedic fracture detection and classification.
          </p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 mb-4 text-sm text-justify">
            Research-focused X-ray analysis system designed to assist medical
            professionals in diagnostic imaging.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
