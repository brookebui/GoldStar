import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportRule, ruleLink, type ExportFormat, type ShareableRule } from "@/data/rule-export";

const formats: { id: ExportFormat; label: string }[] = [
  { id: "agents", label: "AGENTS.md" },
  { id: "cursor", label: ".cursorrules" },
  { id: "claude", label: "Claude instructions" },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return <Button variant="outline" size="sm" onClick={() => { void navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : label}</Button>;
}

export function ShareRuleButton({ rule, className }: { rule: ShareableRule; className?: string }) {
  const [open, setOpen] = useState(false);
  const link = typeof window === "undefined" ? "" : ruleLink(window.location.origin, rule.id);
  return <>
    <Button variant="ghost" size="sm" className={className} aria-label={`Share ${rule.name}`} onClick={() => setOpen(true)}><Share2 className="size-3.5" />Share</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share rule</DialogTitle>
          <DialogDescription>Align your team's agents on this rule so nobody has to correct it twice.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <p className="gs-overline mb-2">Applies to</p>
            {rule.projectNames.length ? <div className="flex flex-wrap gap-1.5">{rule.global && <Badge variant="neutral">Global</Badge>}{rule.projectNames.map((n) => <Badge key={n} variant="neutral">{n}</Badge>)}</div> : <p className="gs-caption">Not attached to any project yet.</p>}
          </div>
          <div>
            <p className="gs-overline mb-2">Team link <span className="normal-case text-muted-foreground">· demo link</span></p>
            <div className="flex items-center gap-2"><input readOnly value={link} aria-label="Rule link" className="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2 gs-code" /><CopyButton text={link} label="Copy link" /></div>
          </div>
          <div>
            <p className="gs-overline mb-2">Export for team</p>
            <Tabs defaultValue="agents">
              <TabsList>{formats.map((f) => <TabsTrigger key={f.id} value={f.id}>{f.label}</TabsTrigger>)}</TabsList>
              {formats.map((f) => { const text = exportRule(rule, f.id); return <TabsContent key={f.id} value={f.id} className="space-y-2"><pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background p-3 gs-code">{text}</pre><div className="flex justify-end"><CopyButton text={text} label="Copy" /></div></TabsContent>; })}
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
