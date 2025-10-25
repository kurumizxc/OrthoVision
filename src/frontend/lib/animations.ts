export const slideUpVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 12,
    },
  },
};

// Parent variant that staggers child animations
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Reuse slide-up for individual items
export const itemVariants = slideUpVariants;

export const buttonVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 12,
      delay: 0.3,
    },
  },
};

// Convenience props for sections that animate on scroll into view
export const sectionMotionProps = {
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: {
    once: true,
    amount: 0.3,
  },
  variants: containerVariants,
};

/**
 * Animation variants and helpers for motion components: slide-up items,
 * staggered containers, delayed buttons, and on-view section props.
 */
