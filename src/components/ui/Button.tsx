import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

const BASE =
  "inline-flex min-h-11 items-center justify-center rounded-md border px-6 text-sm font-medium transition-colors";

const VARIANTS: Record<Variant, string> = {
  primary: "border-brand bg-brand text-on-brand hover:border-brand-hover hover:bg-brand-hover",
  secondary: "border-line text-ink hover:border-brand",
};

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type ButtonProps =
  | (BaseProps & { href: string; onClick?: never; autoFocus?: never })
  | (BaseProps & { href?: never; onClick: () => void; autoFocus?: boolean });

export default function Button({ variant = "primary", className = "", children, ...action }: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;

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
