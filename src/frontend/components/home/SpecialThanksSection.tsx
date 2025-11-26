"use client";

import { motion } from "motion/react";
import { itemVariants, sectionMotionProps } from "@/lib/animations";

export function SpecialThanksSection() {
  return (
    <motion.section
      className="rounded-lg p-6 bg-transparent shadow-none py-6 text-center pb-24"
      {...sectionMotionProps}
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-gray-900 mb-2 text-2xl font-bold">
          Special Thanks
        </h2>
      </motion.div>
      <div className="space-y-4">
        <motion.div variants={itemVariants}>
          <p className="font-medium text-gray-600 text-sm">
            Dr. Frank I. Elijorde
          </p>
          <p className="text-xs text-gray-500">Research Adviser</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="font-medium text-gray-600 text-sm">
            Dr. Mylo N. Soriaso
          </p>
          <p className="text-xs text-slate-500">Domain Expert</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="font-medium text-gray-600 text-sm">
            Dr. Ryan T. Laglagaron
          </p>
          <p className="text-xs text-slate-500">Contributor</p>
        </motion.div>
      </div>
    </motion.section>
  );
}

/**
 * Special thanks section acknowledging contributors
 */
