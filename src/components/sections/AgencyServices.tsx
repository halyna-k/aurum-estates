import { agency } from "@/agency/config";
import { SERVICES } from "@/agency/services";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import ServiceCard from "@/components/services/ServiceCard";

export default function AgencyServices() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative bg-page py-8 md:py-12"
    >
      <Container>
        <SectionHeader id="services-title" {...agency.sections.services} />

        <ul className="grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
