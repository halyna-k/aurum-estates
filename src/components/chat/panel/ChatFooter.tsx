import { agency } from "@/agency/config";

export default function ChatFooter({ showPrivacy }: { showPrivacy: boolean }) {
  const { phone } = agency.chat.humanContact;
  const link = "inline-flex min-h-11 items-center";
  const underline = "underline underline-offset-2 hover:text-ink";

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 px-4 text-xs text-ink-muted">
      <a href={`tel:${phone.replace(/\s/g, "")}`} className={link}>
        Speak to a person:&nbsp;<span className={underline}>{phone}</span>
      </a>
      {showPrivacy && (
        <>
          <span aria-hidden="true">·</span>
          <a
            href={agency.legal.privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${link} ${underline}`}
          >
            Privacy notice
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </>
      )}
    </div>
  );
}
