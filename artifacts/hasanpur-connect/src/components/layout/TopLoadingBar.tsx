import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export default function TopLoadingBar() {
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevLocation = useRef(location);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (location === prevLocation.current) return;
    prevLocation.current = location;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    setProgress(0);
    setVisible(true);

    let start: number | null = null;
    const duration = 400;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(90, (elapsed / duration) * 90);
      setProgress(p);
      if (p < 90) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    timerRef.current = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 300);
    }, duration + 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [location]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: "3px",
        background: "hsl(var(--primary))",
        zIndex: 9999,
        transition: progress === 100 ? "width 0.1s ease, opacity 0.3s ease" : "width 0.2s ease",
        opacity: progress === 100 ? 0 : 1,
        borderRadius: "0 2px 2px 0",
        boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
      }}
    />
  );
}
