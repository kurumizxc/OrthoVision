"use client";

import { motion } from "motion/react";
import { itemVariants, sectionMotionProps } from "@/lib/animations";

export function AuthorsSection() {
  return (
    <motion.section
      className="rounded-lg p-6 bg-transparent shadow-none py-6 text-center"
      {...sectionMotionProps}
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-gray-900 mb-2 text-2xl font-bold">Authors</h2>
      </motion.div>
      <div className="space-y-1">
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 text-sm">John Doe</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 text-sm">John Doe</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 text-sm">John Doe</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 text-sm">John Doe</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <p className="text-gray-600 text-sm">John Doe</p>
        </motion.div>
      </div>
    </motion.section>
  );
}

/**
 * AuthorsSection lists project contributors
 */
