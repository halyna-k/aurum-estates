import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  desc?: ReactNode;
};

export default function SectionHeader({ eyebrow, title, desc }: SectionHeaderProps) {
  return (
    <>
      <div className="ornament">
        <div className="ornament-line" />
        <div className="ornament-diamond" />
        <div className="ornament-line" />
      </div>

      {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}

      {title && <h2 className="section-title">{title}</h2>}

      {desc && <p className="section-desc">{desc}</p>}
    </>
  );
}
