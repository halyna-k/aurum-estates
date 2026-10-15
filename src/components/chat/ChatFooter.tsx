import { agency } from "@/agency/config";

export default function ChatFooter() {
  const { phone } = agency.chat.humanContact;
  const linkClass = "underline underline-offset-2 hover:text-ink";

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line p-3 text-xs text-ink-muted sm:p-5">
      <a href={`tel:${phone.replace(/\s/g, "")}`}>
        Speak to a person: <span className={linkClass}>{phone}</span>
      </a>
      <a
        href={agency.legal.privacyPolicyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Privacy notice
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
