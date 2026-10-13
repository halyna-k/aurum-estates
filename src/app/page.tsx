import Hero from "@/components/sections/Hero";
import AgencyServices from "@/components/sections/AgencyServices";
import PropertiesList from "@/components/sections/PropertiesList";

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <AgencyServices />
      <PropertiesList />
    </>
  );
}
