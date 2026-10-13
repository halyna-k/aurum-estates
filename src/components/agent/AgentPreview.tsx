import { formatGbp } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/leads/labels";
import type { AgentPreview as Preview } from "@/types/chat";
import type { LeadAnswers } from "@/types/lead";
import TriageBadge from "../chat/TriageBadge";

interface AgentPreviewProps {
  preview: Preview;
  lead: Partial<LeadAnswers>;
}

function yesNo(value: boolean | undefined): string | undefined {
  return value === undefined ? undefined : value ? "Yes" : "No";
}

export default function AgentPreview({ preview, lead }: AgentPreviewProps) {
  const rows: [string, string | undefined][] = [
    ["Name", lead.fullName],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Looking for", lead.bedrooms === undefined ? undefined : lead.bedrooms === 0 ? "Studio" : `${lead.bedrooms} bed`],
    ["Area", lead.area],
    ["Budget", lead.budget === undefined ? undefined : `${formatGbp(lead.budget)} pcm`],
    ["Move-in", lead.moveInDate],
    ["Income", lead.annualIncome === undefined ? undefined : `${formatGbp(lead.annualIncome)} a year`],
    ["Guarantor", yesNo(lead.hasGuarantor)],
    ["Occupants", lead.occupants?.toString()],
    ["Pets", yesNo(lead.hasPets)],
    ["Viewing", lead.viewingPreference],
  ];

  return (
    <aside
      aria-label="Demo: what the agent receives"
      className="fixed right-[27rem] bottom-24 z-(--z-modal) hidden w-72 rounded-lg border border-line bg-surface p-4 shadow-panel lg:block"
    >
      <p className="text-xs text-ink-muted">
        Demo only. This is what the agent receives in the lead sheet. Applicants never see this
        label, and a person makes every decision.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TriageBadge qualification={preview.qualification} />
        <span className="text-xs text-ink-muted">
          {STATUS_LABELS[preview.status]} · ref {preview.reference}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rows.map(([label, value]) =>
          value ? (
            <div key={label} className="contents">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="text-ink [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
    </aside>
  );
}
