"use client";

import { memo } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  children: React.ReactNode;
  className?: string;
};

const spring = { type: "spring" as const, stiffness: 100, damping: 22, mass: 0.8 };

function Reveal({ delay = 0, children, className, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px", amount: 0.2 }}
      transition={{ ...spring, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default memo(Reveal);
