import { agency } from "@/agency/config";
import Button from "@/components/ui/Button";

interface PrivacyNoticeProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function PrivacyNotice({ onAccept, onDecline }: PrivacyNoticeProps) {
  const { retentionMonths, privacyPolicyUrl } = agency.legal;
  const months = `${retentionMonths} ${retentionMonths === 1 ? "month" : "months"}`;

  return (
    <div className="mx-4 mb-2 shrink-0 rounded-xl bg-surface-2 p-4">
      <h3 className="text-sm font-medium text-ink">Before we start</h3>

      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        {agency.brand.name} uses what you share only to follow up your enquiry.
      </p>

      <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-relaxed text-ink-secondary marker:text-brand">
        <li>
          We keep your details for up to {months}. You can ask to see or delete them at any time.
        </li>
        <li>Your messages are processed by our AI and hosting providers.</li>
        <li>Please do not share sensitive details such as health or religion.</li>
      </ul>

      <p className="mt-4 text-sm">
        Read the full
        <a
          href={privacyPolicyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-ink underline underline-offset-2 hover:text-brand"
        >
          Privacy notice
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>

      {agency.isDemo && (
        <p className="mt-4 rounded-lg bg-brand/10 px-3 py-2 text-xs text-ink-secondary">
          This is a demo. Only enter details you are happy for us to hold.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Button onClick={onAccept} autoFocus className="flex-1">
          Continue
        </Button>
        <Button onClick={onDecline} variant="secondary" className="shrink-0">
          No thanks
        </Button>
      </div>
    </div>
  );
}
