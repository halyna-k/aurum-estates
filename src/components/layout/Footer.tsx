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
  ].filter(Boolean);

  return (
    <footer id="contact" className="border-t border-line bg-surface">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{brand.tagline}</p>
          </div>

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="text-sm font-medium text-ink">
              Contact
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
              <li>
                <a href={`mailto:${email}`} className="hover:text-ink hover:underline">
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="hover:text-ink hover:underline"
                >
                  {phone}
                </a>
              </li>
              <li>{hours}</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-xs leading-relaxed text-ink-muted sm:flex-row md:text-sm">
          {isDemo ? (
            <p className="text-xs">
              {brand.name} is a fictional agency created to demonstrate an AI lettings assistant.
              <br />
              Listings, prices and photos are illustrative.
            </p>
          ) : (
            legalLines
              .filter((line): line is string => Boolean(line))
              .map((line) => <p key={line}>{line}</p>)
          )}
          <div className="space-y-2 sm:ml-auto sm:text-right">
            <p className="text-xs md:text-sm">
              &copy; {new Date().getFullYear()} {brand.name}.{" "}
              <Link
                href={legal.privacyPolicyUrl}
                className="ml-3 underline underline-offset-2 hover:text-ink"
              >
                Privacy notice
              </Link>
            </p>
            <p>Developed by {DEVELOPER}.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
