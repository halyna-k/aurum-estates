import { agency } from "@/agency/config";
import { PROPERTIES } from "@/agency/properties";
import Container from "@/components/ui/Container";
import PropertyCard from "@/components/property/PropertyCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function PropertiesList() {
  return (
    <section
      id="properties"
      aria-labelledby="properties-title"
      className="relative bg-page py-8 md:py-12"
    >
      <Container>
        <SectionHeader id="properties-title" {...agency.sections.properties} />

        <ul className="grid gap-6 md:grid-cols-3">
          {PROPERTIES.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
