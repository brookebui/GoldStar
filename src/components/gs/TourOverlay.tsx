import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tourSteps } from "@/data/onboarding";
import { useOnboarding } from "./OnboardingProvider";

const pad = 8;
const cardW = 320;
const cardH = 168;
const gap = 14;
const tip = 10;

type Side = "right" | "left" | "bottom" | "top";

function placeCard(hole: { top: number; left: number; width: number; height: number }) {
  const cx = hole.left + hole.width / 2;
  const cy = hole.top + hole.height / 2;
  const roomRight = window.innerWidth - (hole.left + hole.width) - gap - 16;
  const roomLeft = hole.left - gap - 16;
  const roomBottom = window.innerHeight - (hole.top + hole.height) - gap - 16;
  const roomTop = hole.top - gap - 16;
  let side: Side = "bottom";
  if (roomRight >= cardW) side = "right";
  else if (roomLeft >= cardW) side = "left";
  else if (roomBottom >= cardH) side = "bottom";
  else if (roomTop >= cardH) side = "top";
  else side = roomRight >= roomLeft ? "right" : "left";

  let top = 16;
  let left = 16;
  if (side === "right") {
    left = Math.min(window.innerWidth - cardW - 16, hole.left + hole.width + gap);
    top = Math.min(window.innerHeight - cardH - 16, Math.max(16, cy - cardH / 2));
  } else if (side === "left") {
    left = Math.max(16, hole.left - gap - cardW);
    top = Math.min(window.innerHeight - cardH - 16, Math.max(16, cy - cardH / 2));
  } else if (side === "bottom") {
    top = Math.min(window.innerHeight - cardH - 16, hole.top + hole.height + gap);
    left = Math.min(window.innerWidth - cardW - 16, Math.max(16, cx - cardW / 2));
  } else {
    top = Math.max(16, hole.top - gap - cardH);
    left = Math.min(window.innerWidth - cardW - 16, Math.max(16, cx - cardW / 2));
  }

  const tipAlong = side === "left" || side === "right"
    ? Math.min(cardH - tip * 2 - 8, Math.max(tip + 8, cy - top - tip))
    : Math.min(cardW - tip * 2 - 8, Math.max(tip + 8, cx - left - tip));

  return { side, top, left, tipAlong };
}

function getInitialRect(id?: string): DOMRect | null {
  if (typeof document === "undefined" || !id) return null;
  const el = document.querySelector(`[data-tour="${id}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? rect : null;
}

export function TourOverlay({ onNavigate }: { onNavigate: (to: "/" | "/canvas") => void | Promise<unknown> }) {
  const { phase, step, next, back, skip } = useOnboarding();
  const current = tourSteps[step];
  const [box, setBox] = useState<DOMRect | null>(() => getInitialRect(current?.id));

  useEffect(() => {
    if (phase !== "tour" || !current) return;
    let cancelled = false;
    void (async () => {
      const immediate = document.querySelector(`[data-tour="${current.id}"]`);
      if (immediate) {
        const rect = immediate.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            immediate.scrollIntoView({ behavior: "smooth", block: "nearest" });
            requestAnimationFrame(() => {
              if (!cancelled) setBox(immediate.getBoundingClientRect());
            });
          } else {
            setBox(rect);
          }
        }
      }

      if (window.location.pathname !== current.route) {
        await onNavigate(current.route);
      }

      for (let i = 0; i < 24 && !cancelled; i++) {
        const el = document.querySelector(`[data-tour="${current.id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setBox(rect);
            return;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (!cancelled) setBox(null);
    })();
    const measure = () => {
      const el = document.querySelector(`[data-tour="${current.id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setBox(rect);
        }
      }
    };
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [phase, step, current, onNavigate]);

  if (phase !== "tour" || !current) return null;

  const hole = box && {
    top: Math.max(0, Math.round(box.top - pad)),
    left: Math.max(0, Math.round(box.left - pad)),
    width: Math.min(window.innerWidth - Math.max(0, Math.round(box.left - pad)), Math.round(box.width + pad * 2)),
    height: Math.min(window.innerHeight - Math.max(0, Math.round(box.top - pad)), Math.round(box.height + pad * 2)),
  };
  const placed = hole ? placeCard(hole) : null;

  const clipPath = hole
    ? `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${hole.left}px ${hole.top}px, ${hole.left}px ${hole.top + hole.height}px, ${hole.left + hole.width}px ${hole.top + hole.height}px, ${hole.left + hole.width}px ${hole.top}px, ${hole.left}px ${hole.top}px)`
    : undefined;

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-step-title">
      <div
        className="tour-blur"
        style={clipPath ? { clipPath, WebkitClipPath: clipPath } : undefined}
      />
      <div
        className={cn("tour-card", placed && `tour-card-${placed.side}`)}
        style={placed ? {
          top: placed.top,
          left: placed.left,
          ["--tour-tip" as string]: `${placed.tipAlong}px`,
        } : { top: 80, left: 16 }}
      >
        {placed && <span className="tour-pointer" aria-hidden />}
        <p className="gs-overline mb-2">Step {step + 1} of {tourSteps.length}</p>
        <h2 id="tour-step-title" className="gs-compact-title">{current.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{current.body}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {step > 0 && <Button variant="outline" size="sm" onClick={back}>Back</Button>}
          <Button size="sm" onClick={next}>{step === tourSteps.length - 1 ? "Done" : "Next"}</Button>
          <Button variant="ghost" size="sm" className={cn("ml-auto text-muted-foreground")} onClick={skip}>Skip</Button>
        </div>
      </div>
    </div>
  );
}
