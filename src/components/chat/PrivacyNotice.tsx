import { agency } from "@/agency/config";
import Button from "@/components/ui/Button";

interface PrivacyNoticeProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function PrivacyNotice({ onAccept, onDecline }: PrivacyNoticeProps) {
  const { assistantName } = agency.chat;
  const { retentionMonths, privacyPolicyUrl } = agency.legal;
  const months = `${retentionMonths} ${retentionMonths === 1 ? "month" : "months"}`;

  return (
    <div className="shrink-0 border-t border-line bg-surface-2 p-4">
      <h3 className="text-sm font-medium text-ink">Before we start</h3>

      <p className="mt-3 text-xs leading-relaxed text-ink-secondary">
        {assistantName} is an AI assistant. {agency.brand.name} will use your name, contact details,
        rental requirements and income to follow up your enquiry. Your messages are processed by our
        AI and hosting providers, and we keep your details for up to {months}. You can ask us to
        show you or delete them at any time. Please do not share sensitive details such as health or
        religion.
      </p>

      {agency.isDemo && (
        <p className="mt-3 text-xs leading-relaxed text-ink-secondary">
          This is a demonstration. Only enter details you are happy for us to hold.
        </p>
      )}

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

      <div className="mt-4 flex gap-2">
        <Button onClick={onAccept} autoFocus className="flex-1">
          Continue
        </Button>
        <Button onClick={onDecline} variant="secondary">
          No thanks
        </Button>
      </div>
    </div>
  );
}
