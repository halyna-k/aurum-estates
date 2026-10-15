import { TRIAGE_LABELS } from "@/lib/leads/labels";
import type { LeadQualification } from "@/types/qualification";

const DOT: Record<LeadQualification, string> = {
  qualified: "bg-success",
  conditional: "bg-warning",
  needs_review: "bg-ink-muted",
};

export default function TriageBadge({ qualification }: { qualification: LeadQualification }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink">
      <span aria-hidden="true" className={`size-2 rounded-full ${DOT[qualification]}`} />
      {TRIAGE_LABELS[qualification]}
    </span>
  );
}
