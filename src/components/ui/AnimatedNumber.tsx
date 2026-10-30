import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const AnimatedNumber = ({
  value,
  duration = 900,
  format,
  className,
}: AnimatedNumberProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return;

    let frame = 0;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);
      const next = from + delta * easeOutCubic(progress);
      setDisplay(next);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        fromRef.current = value;
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, prefersReducedMotion]);

  const rendered = format ? format(display) : String(Math.round(display));

  return <span className={className}>{rendered}</span>;
};

export default AnimatedNumber;
