import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProposedRuleEditor({ markdown, onSave }: { markdown: string; onSave: (value: string) => void }) {
  const [saved, setSaved] = useState(markdown);
  const [draft, setDraft] = useState(markdown);
  const [editing, setEditing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(editing ? draft : saved);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  const tabClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
      active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <section aria-label="Proposed rule">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
          <button
            type="button"
            aria-pressed={editing}
            onClick={() => { setDraft(saved); setEditing(true); setCopyStatus("idle"); }}
            className={tabClass(editing)}
          >
            <Pencil className="size-3" strokeWidth={1.8} /> Edit
          </button>
          <button
            type="button"
            onClick={copyMarkdown}
            className={tabClass(false)}
          >
            {copyStatus === "copied" ? <Check className="size-3" strokeWidth={1.8} /> : <Copy className="size-3" strokeWidth={1.8} />}
            {copyStatus === "copied" ? "Copied" : "Copy"}
          </button>
        </div>
        <span role="status" className={copyStatus === "error" ? "block px-4 pt-2 text-xs text-destructive" : "sr-only"}>
          {copyStatus === "copied" ? "Markdown copied to clipboard" : copyStatus === "error" ? "Couldn’t copy. Try again or copy the text from Edit mode." : ""}
        </span>
        {editing ? (
          <div>
            <textarea autoFocus aria-label="Rule markdown" value={draft} spellCheck={false} rows={10}
              onChange={(event) => { setDraft(event.target.value); setCopyStatus("idle"); }}
              className="gs-code block w-full resize-y bg-card p-4 text-foreground outline-none" />
            <div className="flex justify-end gap-2 border-t border-border p-2">
              <Button variant="outline" size="sm" onClick={() => { setDraft(saved); setEditing(false); setCopyStatus("idle"); }}>Cancel</Button>
              <Button size="sm" onClick={() => { onSave(draft); setSaved(draft); setEditing(false); setCopyStatus("idle"); }}>Save</Button>
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
