import { agency } from "@/agency/config";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function Hero() {
  const { eyebrow, headline, subtitle, intro, facts } = agency.hero;

  return (
    <section className="relative isolate flex min-h-[95dvh] items-center overflow-hidden bg-page bg-hero-glow py-12 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-lines opacity-25"
      />

      <Container className="animate-hero-in text-center">
        <p className="flex items-center justify-center gap-4 text-xs tracking-label text-brand uppercase md:tracking-eyebrow md:before:h-px md:before:w-10 md:before:bg-brand/45 md:after:h-px md:after:w-10 md:after:bg-brand/45">
          {eyebrow}
        </p>

        <h1 className="mt-6 font-serif text-display font-light text-balance text-ink">
          {headline.lead} <span className="text-brand italic">{headline.accent}</span>{" "}
          {headline.tail}
        </h1>

        <p className="mt-4 font-serif text-lead font-light text-ink-secondary italic">{subtitle}</p>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ink-secondary">{intro}</p>

        <div className="mt-8 flex flex-col items-center gap-4 md:mt-10 md:flex-row md:justify-center">
          <Button href="#properties" className="min-w-52">
            View properties
          </Button>
          <Button href="#services" variant="secondary" className="min-w-52">
            Our services
          </Button>
        </div>

        <dl className="mt-10 grid auto-cols-fr grid-flow-col border-y border-line md:mt-12">
          {facts.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col gap-1 border-line px-2 py-4 not-last:border-r md:gap-2 md:p-6"
            >
              <dt className="font-serif text-xl leading-none font-light whitespace-nowrap text-brand md:text-4xl">
                {value}
              </dt>
              <dd className="text-xs leading-snug text-balance text-ink-muted md:tracking-label md:uppercase">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
