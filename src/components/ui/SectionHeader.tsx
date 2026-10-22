interface SectionHeaderProps {
  id: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
}

function renderTitle(title: string, accent?: string) {
  if (!accent || !title.includes(accent)) return title;
  const [before, ...rest] = title.split(accent);
  return (
    <>
      {before}
      <span className="text-brand italic">{accent}</span>
      {rest.join(accent)}
    </>
  );
}

export default function SectionHeader({
  id,
  eyebrow,
  title,
  accent,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-10">
      <div aria-hidden="true" className="mb-6 flex items-center gap-4">
        <span className="h-px max-w-20 flex-1 bg-line" />
        <span className="size-2 shrink-0 rotate-45 bg-brand opacity-60" />
        <span className="h-px max-w-20 flex-1 bg-line" />
      </div>

      <p className="mb-4 text-xs tracking-eyebrow text-brand uppercase">{eyebrow}</p>

      <h2 id={id} className="mb-4 font-serif text-heading font-light text-balance text-ink">
        {renderTitle(title, accent)}
      </h2>

      {description && (
        <p className="max-w-prose text-sm leading-relaxed text-ink-secondary">{description}</p>
      )}
    </div>
  );
}
