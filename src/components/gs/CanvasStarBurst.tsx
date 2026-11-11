import { Star } from "./Star";

export type CanvasSpark = { id: string; left: number; top: number; dx: number; dy: number; delay: number; dur: number; size: number; rot: number };

export function sparksFromPoint(x: number, y: number, count = 14): CanvasSpark[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const dist = 48 + Math.random() * 90;
    return {
      id: `${i}-${Math.round(x)}-${Math.round(y)}-${Math.random().toString(36).slice(2, 6)}`,
      left: x,
      top: y,
      dx: Math.cos(angle) * dist,
      dy: 70 + Math.random() * 110 + Math.sin(angle) * 20,
      delay: Math.random() * 90,
      dur: 680 + Math.random() * 380,
      size: 7 + Math.random() * 11,
      rot: 120 + Math.random() * 280,
    };
  });
}

export function CanvasStarBurst({ sparks }: { sparks: CanvasSpark[] }) {
  if (sparks.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="canvas-spark"
          style={{
            left: spark.left,
            top: spark.top,
            width: spark.size,
            height: spark.size,
            animationDelay: `${spark.delay}ms`,
            animationDuration: `${spark.dur}ms`,
            ["--dx" as string]: `${spark.dx}px`,
            ["--dy" as string]: `${spark.dy}px`,
            ["--rot" as string]: `${spark.rot}deg`,
          }}
        >
          <Star className="size-full drop-shadow-[0_0_8px_var(--star-glow)]" />
        </span>
      ))}
    </div>
  );
}
