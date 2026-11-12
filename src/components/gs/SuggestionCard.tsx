import { patternStrength, type Suggestion } from "@/data/suggestions";
import { Button } from "@/components/ui/button";

export function SuggestionCard({ s, selected, onSelect, index }: { s: Suggestion; selected: boolean; onSelect: () => void; index: number }) {
  return (
    <Button variant="selection" size="content" aria-pressed={selected} onClick={onSelect} style={{ animationDelay: `${index * 70}ms` }} className="group animate-rise font-normal">
      <SuggestionCardContent s={s} />
    </Button>
  );
}

export function SuggestionCardContent({ s }: { s: Suggestion }) {
  return (
    <>
      <div className="gs-overline mb-3 flex flex-wrap items-center gap-2">
        <span>{s.category}</span>
        <span className={s.confidence >= 0.85 ? "ml-auto text-gold-deep" : "ml-auto"}>{patternStrength(s.confidence)}</span>
      </div>
      <h3 className="gs-card-title">{s.summary ?? s.title}</h3>
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span><b className="font-medium text-foreground">{s.occurrences}</b> corrections</span>
        <span className="size-0.5 rounded-full bg-muted-foreground" />
        <span>{s.traces} traces</span>
      </div>
    </>
  );
}
