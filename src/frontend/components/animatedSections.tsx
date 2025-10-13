"use client";

import { motion } from "motion/react";
import { memo, type ReactNode } from "react";
import { itemVariants, sectionMotionProps } from "@/lib/animations";

const AnimatedSection = memo(function AnimatedSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={`rounded-lg p-6 bg-transparent shadow-none py-6 ${className}`}
      {...sectionMotionProps}
    >
      {children}
    </motion.section>
  );
});

const AnimatedHeading = memo(function AnimatedHeading({
  children,
  className = "text-gray-900 mb-2 font-black text-3xl",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className="mb-6">
      <h2 className={className}>{children}</h2>
    </motion.div>
  );
});

const AnimatedText = memo(function AnimatedText({
  children,
  className = "text-gray-600 text-sm",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <p className={className}>{children}</p>
    </motion.div>
  );
});

export const AnimatedInstructions = memo(function AnimatedInstructions() {
  return (
    <AnimatedSection>
      <AnimatedHeading>How to Use</AnimatedHeading>
      <div className="space-y-4">
        <AnimatedText className="text-gray-600 text-sm text-justify">
          Upload X-ray images via drag-and-drop or select sample images for
          AI-powered fracture analysis.
        </AnimatedText>
        <AnimatedText className="text-gray-600 text-sm text-justify">
          Get instant AI diagnosis with confidence scores and medical
          recommendations in 5-10 seconds.
        </AnimatedText>
        <AnimatedText className="text-gray-600 text-sm text-justify">
          Review detailed findings and recommendations in the interactive canvas
          sidebar.
        </AnimatedText>
      </div>
    </AnimatedSection>
  );
});

export const AnimatedAbout = memo(function AnimatedAbout() {
  return (
    <AnimatedSection>
      <AnimatedHeading>About OrthoVision</AnimatedHeading>
      <div>
        <AnimatedText className="text-gray-600 mb-4 text-justify text-sm">
          Advanced AI medical imaging tool developed at West Visayas State
          University for orthopedic fracture detection and classification.
        </AnimatedText>
        <AnimatedText className="text-gray-600 mb-4 text-sm text-justify">
          Research-focused X-ray analysis system designed to assist medical
          professionals in diagnostic imaging.
        </AnimatedText>
      </div>
    </AnimatedSection>
  );
});

export const AnimatedAuthors = memo(function AnimatedAuthors() {
  return (
    <AnimatedSection className="text-center">
      <AnimatedHeading className="text-gray-900 mb-2 text-2xl font-bold">
        Authors
      </AnimatedHeading>
      <div className="space-y-1">
        <AnimatedText>John Doe</AnimatedText>
        <AnimatedText>John Doe</AnimatedText>
        <AnimatedText>John Doe</AnimatedText>
        <AnimatedText>John Doe</AnimatedText>
        <AnimatedText>John Doe</AnimatedText>
      </div>
    </AnimatedSection>
  );
});

export const AnimatedSpecialThanks = memo(function AnimatedSpecialThanks() {
  return (
    <AnimatedSection className="text-center pb-24">
      <AnimatedHeading className="text-gray-900 mb-2 text-2xl font-bold">
        Special Thanks
      </AnimatedHeading>
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
    </AnimatedSection>
  );
});
