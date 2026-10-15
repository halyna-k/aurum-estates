import Link from "next/link";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#properties", label: "Properties" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/80 backdrop-blur focus:z-100">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 py-2">
        <Logo />

        <nav aria-label="Main" className="w-full sm:w-auto">
          <ul className="flex gap-6 text-sm text-ink-secondary">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
