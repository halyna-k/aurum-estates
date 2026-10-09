import Image from "next/image";
import Link from "next/link";
import { agency } from "@/agency/config";

export default function Logo() {
  const { name, logoSrc } = agency.brand;

  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center font-serif text-xl tracking-widest text-brand uppercase transition-colors hover:text-brand-hover"
    >
      {logoSrc ? (
        <Image src={logoSrc} alt={name} width={160} height={32} className="h-8 w-auto" />
      ) : (
        name
      )}
    </Link>
  );
}
