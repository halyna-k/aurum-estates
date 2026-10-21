import type { ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "sm";

const BASE =
  "inline-flex min-h-11 items-center justify-center rounded-lg border text-xs font-medium tracking-label whitespace-nowrap uppercase transition-colors";

const VARIANTS: Record<Variant, string> = {
  primary: "border-brand bg-brand text-on-brand hover:border-brand-hover hover:bg-brand-hover",
  secondary: "border-line text-ink hover:border-brand",
};

const SIZES: Record<Size, string> = {
  md: "px-6",
  sm: "px-4",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps =
  | (BaseProps & { href: string; onClick?: never; autoFocus?: never })
  | (BaseProps & { href?: never; onClick: () => void; autoFocus?: boolean });

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...action
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (action.href !== undefined) {
    return (
      <a href={action.href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={action.onClick} autoFocus={action.autoFocus} className={classes}>
      {children}
    </button>
  );
}
