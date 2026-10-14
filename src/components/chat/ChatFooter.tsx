interface AgencyProps {
  chat: {
    humanContact: {
      phone: string;
    };
  };
  legal: {
    privacyPolicyUrl: string;
  };
}
export default function ChatFooter({ agency }: { agency: AgencyProps }) {
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
    // <div className="flex shrink-0 items-center justify-center gap-1.5 border-t border-border bg-bg-3 px-3.5 py-2 text-1 tracking-[0.04em] text-muted-foreground opacity-60">
    //   <span>·</span>
    //   <span>UK GDPR compliant</span>
    //   <span>·</span>
    // </div>
  );
}
