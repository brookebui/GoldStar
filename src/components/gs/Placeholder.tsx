import { Star } from "./Star";
export function Placeholder({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="paper-grid flex min-h-screen items-center justify-center px-10">
      <div className="max-w-md animate-rise text-center">
        <Star className="mx-auto mb-6 size-8 opacity-70" />
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-gold-deep">{eyebrow}</p>
        <h1 className="font-display text-5xl tracking-tight">{title}</h1>
        <p className="mt-4 text-muted-foreground">{body}</p>
        <p className="mt-8 inline-block rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">Coming in a later iteration</p>
      </div>
    </div>
  );
}
