import { useEffect, useRef, useState } from "react";

/**
 * A number that counts to its new value when it changes, so a link turning
 * measured reads as data arriving (docs/DESIGN_FRAMEWORK.md, section 6).
 * Whole numbers only, ease-out, no overshoot. Reduced motion jumps straight
 * to the value. The first render shows the value as is, with no count from zero.
 */
function useCountUp(value: number, duration = 600) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (start === value) return;
    const reduce =
      typeof window === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(start + (value - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return shown;
}

/** Inline wrapper: screen readers get the final value, not the frames in between. */
export function CountUp({ value }: { value: number }) {
  const shown = useCountUp(value);
  return (
    <>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}
