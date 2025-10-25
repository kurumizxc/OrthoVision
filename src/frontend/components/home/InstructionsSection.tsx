"use client";

import { motion } from "motion/react";
import { itemVariants, sectionMotionProps } from "@/lib/animations";

export function InstructionsSection() {
  return (
    <motion.section
      className="rounded-lg p-6 bg-transparent shadow-none py-6"
      {...sectionMotionProps}
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-gray-900 mb-2 font-black text-3xl">How to Use</h2>
      </motion.div>
      <div className="space-y-4">
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 text-sm text-justify">
            Upload X-ray images via drag-and-drop or select sample images for
            AI-powered fracture analysis.
          </p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 text-sm text-justify">
            Get instant AI diagnosis with confidence scores and medical
            recommendations in 5-10 seconds.
          </p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 text-sm text-justify">
            Review detailed findings and recommendations in the interactive canvas
            sidebar.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

/**
 * InstructionsSection explains how to use the application through short steps.
 */
