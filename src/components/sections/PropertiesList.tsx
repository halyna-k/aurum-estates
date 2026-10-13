import { agency } from "@/agency/config";
import { PROPERTIES } from "@/agency/properties";
import Container from "@/components/ui/Container";
import PropertyCard from "@/components/ui/PropertyCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function PropertiesList() {
  return (
    <section id="properties" aria-labelledby="properties-title" className="py-8 md:py-16">
      <Container>
        <SectionHeader id="properties-title" {...agency.sections.properties} />

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-6">
          {PROPERTIES.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
