import { QualificationScore } from '@/types/chat';

const SCORE_CONFIG = {
  qualified: {
    label: "Qualified",
    icon: "✓",
    border: "border-green-500",
    bg: "bg-green-500",
    text: "text-green-500",
  },
  conditional: {
    label: "Conditional",
    icon: "~",
    border: "border-amber-500",
    bg: "bg-amber-500",
    text: "text-amber-500",
  },
  declined: {
    label: "Declined",
    icon: "✗",
    border: "border-red-500",
    bg: "bg-red-500",
    text: "text-red-500",
  },
} as const;

export default function ScoreBadge({ score }: { score: QualificationScore }) {
  const cfg = SCORE_CONFIG[score];
  return (
    <div className={`flex items-center gap-1.25 rounded-full border px-2.25 py-0.75 ${cfg.border}`}>
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${cfg.bg}`}
      >
        {cfg.icon}
      </span>

      <span className={`whitespace-nowrap text-[11px] font-medium ${cfg.text}`}>
        {cfg.label}
      </span>
    </div>
  );
}
