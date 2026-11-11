import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
export function StatusBadge({ tone, children, className }: { tone: "positive" | "negative" | "neutral" | "pending"; children: ReactNode; className?: string }) {
  return <Badge variant={tone} className={className}>{children}</Badge>;
}