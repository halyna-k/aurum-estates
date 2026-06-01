import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-10">
      <nav className="nav" aria-label="Main navigation">
        <Link href="/">Aurum <span>Estates</span></Link>

        <ul>
          <li>
            <Link href="#services">Services</Link>
          </li>
          <li>
            <Link href="#properties">Properties</Link>
          </li>
          <li>
            <Link href="#contact">Contact</Link>
          </li>
        </ul>

        <Link href="#properties">Find a Property</Link>

      </nav>
    </header>
  );
}
