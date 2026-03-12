"use client";

import { motion, type Variants } from "framer-motion";
import { Children, type ReactNode } from "react";

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
      delay,
    },
  }),
};

interface MountRevealProps {
  /** Delay in seconds before this element starts animating */
  delay?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Fades up a single element on mount with a configurable delay.
 * Use for page-level entrance animations (not scroll-triggered).
 */
export function MountReveal({ delay = 0, children, className }: MountRevealProps) {
  return (
    <motion.div
      className={className}
      variants={item}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
};

interface MountStaggerProps {
  /** Delay before the stagger sequence starts */
  delay?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Staggers children on mount with 0.08s intervals.
 */
export function MountStagger({ delay = 0, children, className }: MountStaggerProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: delay }}
    >
      {Children.map(children, (child) => (
        <motion.div variants={staggerItem}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
