import type { TargetAndTransition } from "motion/react";

// Hover and focus lift a chip on a spring and fade its hairline and fill in.
export const CHIP_LIFT: TargetAndTransition = {
   scale: 1.06,
   borderColor: "rgba(255, 255, 255, 0.14)",
   backgroundColor: "rgba(255, 255, 255, 0.04)",
};

// Padding replaces part of the old gaps, so the visual rhythm is unchanged.
export const CHIP_SIZES = {
   regular: {
      padding: "6px 12px",
      columnGap: 20,
      rowGap: 12,
      gap: 10,
      fontSize: 15,
      icon: 20,
   },
   small: {
      padding: "5px 10px",
      columnGap: 8,
      rowGap: 6,
      gap: 8,
      fontSize: 13,
      icon: 16,
   },
} as const;
