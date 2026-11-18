"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "./motion";

/**
 * Used by `template.tsx` files: each navigation fades the new page in.
 * `lift` adds a small upward move — keep it off where pages contain
 * `position: fixed` overlays that must not move with the page (e.g. the home intro).
 */
export function PageTransition({ children, lift = true, className }: { children: ReactNode; lift?: boolean; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: lift ? 16 : 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: lift ? 0.55 : 0.45, ease: EASE }}>
      {children}
    </motion.div>
  );
}
