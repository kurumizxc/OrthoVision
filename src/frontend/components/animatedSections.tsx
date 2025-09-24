"use client";

import { motion } from "motion/react";
import { itemVariants, sectionMotionProps } from "@/lib/animations";

export function AnimatedInstructions() {
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
            Review detailed findings and recommendations in the interactive
            canvas sidebar.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

export function AnimatedAbout() {
  return (
    <motion.section
      className="rounded-lg p-6 bg-transparent shadow-none py-6"
      {...sectionMotionProps}
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-gray-900 mb-2 font-black text-3xl">
          About OrthoVision
        </h2>
      </motion.div>
      <div>
        <motion.p
          variants={itemVariants}
          className="text-gray-600 mb-4 text-justify text-sm"
        >
          Advanced AI medical imaging tool developed at West Visayas State
          University for orthopedic fracture detection and classification.
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="text-gray-600 mb-4 text-sm text-justify"
        >
          Research-focused X-ray analysis system designed to assist medical
          professionals in diagnostic imaging.
        </motion.p>
      </div>
    </motion.section>
  );
}

export function AnimatedAuthors() {
  return (
    <motion.section
      className="rounded-lg p-6 bg-transparent shadow-none text-center py-6"
      {...sectionMotionProps}
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-gray-900 mb-2 text-2xl font-bold">Authors</h2>
      </motion.div>
      <div className="space-y-1">
        <motion.p variants={itemVariants} className="text-gray-600 text-sm">
          John Doe
        </motion.p>
        <motion.p variants={itemVariants} className="text-gray-600 text-sm">
          John Doe
        </motion.p>
        <motion.p variants={itemVariants} className="text-gray-600 text-sm">
          John Doe
        </motion.p>
        <motion.p variants={itemVariants} className="text-gray-600 text-sm">
          John Doe
        </motion.p>
        <motion.p variants={itemVariants} className="text-gray-600 text-sm">
          John Doe
        </motion.p>
      </div>
    </motion.section>
  );
}

export function AnimatedSpecialThanks() {
  return (
    <motion.section
      className="rounded-lg p-6 bg-transparent shadow-none text-center py-6 pb-24"
      {...sectionMotionProps}
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-gray-900 mb-2 text-2xl font-bold">
          Special Thanks
        </h2>
      </motion.div>
      <div className="space-y-4">
        <motion.div variants={itemVariants}>
          <p className="font-medium text-gray-600 text-sm">John Doe</p>
          <p className="text-xs text-gray-500">Research Adviser</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="font-medium text-gray-600 text-sm">John Doe</p>
          <p className="text-xs text-slate-500">Domain Expert</p>
        </motion.div>
      </div>
    </motion.section>
  );
}
