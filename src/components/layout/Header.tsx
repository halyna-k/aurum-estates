import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import NavMenu from "./NavMenu";

const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#properties", label: "Properties" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/80 backdrop-blur">
      <Container className="flex items-center justify-between py-2">
        <Logo />
        <NavMenu links={NAV_LINKS} />
      </Container>
    </header>
  );
}
