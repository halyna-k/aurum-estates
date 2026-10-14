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
      className="relative bg-page py-16 md:py-30"
    >
      <Container>
        <SectionHeader id="services-title" {...agency.sections.services} />

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-px border border-line bg-line">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
