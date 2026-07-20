"use client";

import { useEffect, useState } from "react";

// Simple count-up animation. Skips the tween on first mount if the delta is
// tiny or when the user prefers reduced motion.
export function AnimatedNumber({
  value,
  duration = 900,
  format,
}: {
  value: number;
  duration?: number;
  format: (v: number) => string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      setCurrent(value);
      return;
    }
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced) {
      setCurrent(value);
      return;
    }
    const from = current;
    const to = value;
    const start = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setCurrent(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <>{format(current)}</>;
}
