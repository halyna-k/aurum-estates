import { agency } from "@/agency/config";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function Hero() {
  const { eyebrow, headline, subtitle, intro, facts } = agency.hero;

  return (
    <section className="relative isolate flex min-h-[95dvh] items-center overflow-hidden bg-page bg-hero-glow py-16 md:py-30">
      {/* <div
        aria-hidden="true"
        className="bg-grid-lines pointer-events-none absolute inset-0 -z-10 opacity-25"
      /> */}

      <Container className="animate-hero-in text-center">
        <div className="pointer-events-none">
          <p className="flex items-center justify-center gap-4 text-xs tracking-[0.32em] text-brand uppercase before:h-px before:w-10 before:bg-brand/45 before:content-[''] after:h-px after:w-10 after:bg-brand/45 after:content-['']">
            {eyebrow}
          </p>

          <h1 className="mt-7 font-serif text-[clamp(3rem,8.5vw,6.25rem)] leading-[1.04] font-light tracking-[0.01em] text-balance text-ink">
            {headline.lead} <span className="text-brand italic">{headline.accent}</span>{" "}
            {headline.tail}
          </h1>

          <p className="mt-4 font-serif text-[clamp(1.0625rem,2.2vw,1.5rem)] font-light text-ink-secondary italic">
            {subtitle}
          </p>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-[1.85] text-ink-secondary">{intro}</p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Button href="#properties">View properties</Button>
          <Button href="#services" variant="secondary">
            Our services
          </Button>
        </div>

        <dl className="mt-16 grid border-y border-line sm:grid-cols-3">
          {facts.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col gap-1.5 border-line px-5 py-7 max-sm:not-last:border-b sm:not-last:border-r"
            >
              <dt className="font-serif text-[2.5rem] leading-none font-light text-brand">
                {value}
              </dt>
              <dd className="text-xs tracking-[0.2em] text-ink-muted uppercase">{label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
