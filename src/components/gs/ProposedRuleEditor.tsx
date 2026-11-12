import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShareRuleButton } from "./ShareRuleDialog";
import type { ShareableRule } from "@/data/rule-export";

export interface ProposedRuleEditorProps {
  markdown: string;
  onSave: (value: string) => void;
  rule?: Partial<ShareableRule>;
}

export function ProposedRuleEditor({ markdown, onSave, rule }: ProposedRuleEditorProps) {
  const [saved, setSaved] = useState(markdown);
  const [draft, setDraft] = useState(markdown);
  const [editing, setEditing] = useState(false);

  const tabClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
      active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
    );

  const shareable: ShareableRule = {
    id: rule?.id ?? "proposed-rule",
    name: rule?.name ?? "Proposed rule",
    markdown: editing ? draft : saved,
    projectNames: rule?.projectNames ?? [],
    global: rule?.global ?? false,
  };

  return (
    <section aria-label="Proposed rule">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
          <button
            type="button"
            aria-pressed={editing}
            onClick={() => { setDraft(saved); setEditing(true); }}
            className={tabClass(editing)}
          >
            <Pencil className="size-3" strokeWidth={1.8} /> Edit
          </button>
          <ShareRuleButton
            rule={shareable}
            className={cn(tabClass(false), "h-auto border-0 bg-transparent shadow-none hover:bg-transparent")}
          />
        </div>
        {editing ? (
          <div>
            <textarea autoFocus aria-label="Rule markdown" value={draft} spellCheck={false} rows={10}
              onChange={(event) => { setDraft(event.target.value); }}
              className="gs-code block w-full resize-y bg-card p-4 text-foreground outline-none" />
            <div className="flex justify-end gap-2 border-t border-border p-2">
              <Button variant="outline" size="sm" onClick={() => { setDraft(saved); setEditing(false); }}>Cancel</Button>
              <Button size="sm" onClick={() => { onSave(draft); setSaved(draft); setEditing(false); }}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="gs-rule-markdown min-h-32 bg-muted/40 p-4">
            <ReactMarkdown skipHtml>{saved}</ReactMarkdown>
          </div>
        )}
      </div>
    </section>
  );
}
