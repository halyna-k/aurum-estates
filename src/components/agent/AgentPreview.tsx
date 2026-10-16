import { formatDate, formatGbp } from "@/lib/format";
import { EMPLOYMENT_LABELS, PROPERTY_TYPE_LABELS, STATUS_LABELS } from "@/lib/leads/labels";
import type { AgentPreviewData } from "@/types/chat";
import type { LeadAnswers } from "@/types/lead";
import TriageBadge from "./TriageBadge";
import { bedroomsLabel } from "@/lib/property";

interface AgentPreviewProps {
  preview: AgentPreviewData;
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
    ["Property type", lead.propertyType && PROPERTY_TYPE_LABELS[lead.propertyType]],
    ["Bedrooms", lead.bedrooms === undefined ? undefined : bedroomsLabel(lead.bedrooms)],
    ["Area", lead.area],
    ["Budget", lead.budget === undefined ? undefined : `${formatGbp(lead.budget)} pcm`],
    ["Move-in", lead.moveInDate && formatDate(lead.moveInDate)],
    ["Employment", lead.employmentStatus && EMPLOYMENT_LABELS[lead.employmentStatus]],
    [
      "Income",
      lead.annualIncome === undefined ? undefined : `${formatGbp(lead.annualIncome)} a year`,
    ],
    ["Guarantor", yesNo(lead.hasGuarantor)],
    ["Occupants", lead.occupants?.toString()],
    ["Pets", yesNo(lead.hasPets)],
    ["Viewing", lead.viewingPreference],
  ];

  return (
    <aside
      aria-label="Demo: what the agent receives"
      className="fixed right-[27rem] bottom-24 z-50 hidden w-72 rounded-lg border border-line bg-surface p-4 shadow-panel lg:block"
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
              <dd className="[overflow-wrap:anywhere] text-ink">{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
    </aside>
  );
}
