"use client";

import { motion } from "motion/react";
import { itemVariants } from "@/lib/animations";

/**
 * Animated page header for the landing page
 * Client component due to motion animations
 */
export function PageHeader() {
  return (
    <motion.header variants={itemVariants} className="text-center">
      <h1 className="text-3xl text-gray-900 mb-0 font-black">OrthoVision</h1>
      <p className="text-gray-600">
        AI-Powered Fracture Detection & Classification
      </p>
    </motion.header>
  );
}
