"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useReducedMotion,
} from "framer-motion";

/**
 * Count a number up on mount. `format` renders each frame's value.
 * Respects prefers-reduced-motion (jumps straight to the value).
 */
export function CountUp({
  value,
  duration = 1.1,
  decimals = 0,
  format,
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const started = useRef(false);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    started.current = true;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  const text = format
    ? format(display)
    : display.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return <span className={className}>{text}</span>;
}
