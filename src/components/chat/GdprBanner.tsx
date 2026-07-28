type GdprBannerProps = {
  onAccept: () => void;
  onDecline: () => void;
};

export default function GdprBanner({ onAccept, onDecline }: GdprBannerProps) {
  return (
    <div className="shrink-0 border-b border-(--border) bg-(--bg-3) px-4.5 py-5">
      <p className="mb-2 text-[13px] font-semibold tracking-[0.02em] text-primary">
        Data Privacy Notice
      </p>

      <p className="mb-4 text-[12px] leading-[1.65] text-secondary">
        To help find your ideal property, I need to collect personal information
        (name, contact details, financial information). This is processed under{" "}
        <strong className="text-primary">UK GDPR</strong> solely for rental
        matching and booking viewings. Your data will not be shared with third
        parties without consent.
      </p>

      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 rounded bg-(--gold) px-3 py-2.25 text-[11px] font-medium tracking-[0.08em] text-white transition-colors hover:bg-gold-light"
        >
          I Consent — Continue
        </button>

        <button
          onClick={onDecline}
          className="rounded border border-(--border) bg-transparent px-3.5 py-2.25 text-[11px] text-muted-foreground transition-colors hover:border-muted-foreground hover:text-primary"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
