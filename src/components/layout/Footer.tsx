import Link from "next/link";
import { agency } from "@/agency/config";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";

const DEVELOPER = "GK";

const REDRESS_SCHEMES = {
  TPO: "The Property Ombudsman",
  PRS: "The Property Redress Scheme",
} as const;

export default function Footer() {
  const { brand, legal, isDemo } = agency;
  const { phone, email, hours } = agency.chat.humanContact;

  const legalLines = [
    legal.companyNumber && `${legal.companyName}, company number ${legal.companyNumber}`,
    legal.registeredAddress && `Registered office: ${legal.registeredAddress}`,
    legal.redressScheme && `Member of ${REDRESS_SCHEMES[legal.redressScheme]}`,
    legal.clientMoneyProtection && `Client money protection: ${legal.clientMoneyProtection}`,
    legal.icoRegistrationNumber && `ICO registration number: ${legal.icoRegistrationNumber}`,
  ].filter((line): line is string => Boolean(line));

  return (
    <footer id="contact" className="border-t border-line bg-surface">
      <Container className="py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="text-sm text-ink-secondary">{brand.tagline}</p>
          </div>

          <section aria-labelledby="footer-contact" className="md:text-right">
            <h2 id="footer-contact" className="sr-only">
              Contact
            </h2>
            <ul className="flex flex-wrap gap-x-6 text-sm text-ink-secondary md:justify-end">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-h-11 items-center hover:text-ink hover:underline"
                >
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex min-h-11 items-center hover:text-ink hover:underline"
                >
                  {phone}
                </a>
              </li>
              <li className="w-full text-xs text-ink-muted">{hours}</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-line pt-4 pr-12 text-xs text-ink-muted md:flex-row md:flex-wrap md:items-center md:justify-between md:pr-18">
          <div className="space-y-1">
            {isDemo ? (
              <p>
                {brand.name} is a fictional agency created to demonstrate an AI lettings assistant.
                Listings, prices and photos are illustrative.
              </p>
            ) : (
              legalLines.map((line) => <p key={line}>{line}</p>)
            )}
          </div>

          <p className="flex flex-wrap items-center gap-x-3">
            <span>
              &copy; {new Date().getFullYear()} {brand.name}
            </span>
            <span aria-hidden="true">·</span>
            <Link
              href={legal.privacyPolicyUrl}
              className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-ink"
            >
              Privacy notice
            </Link>
            <span aria-hidden="true" className="hidden md:inline">
              ·
            </span>
            <span>Developed by {DEVELOPER}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
