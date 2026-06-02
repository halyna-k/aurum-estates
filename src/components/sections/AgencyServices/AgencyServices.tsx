import { SectionHeader } from "@/components";

export default function AgencyServices() {
  return (
    <section className="section container" id="services">
      <SectionHeader
        eyebrow="What We Offer"
        title={
          <>
            A Full Spectrum <br />
            of <em>Property Services</em>
          </>
        }
        desc="From first enquiry to signed tenancy, our team and AI tools guide you through every step."
      />
      <div className="grid">
        <p>Service Card</p>
        <p>Service Card</p>
        <p>Service Card</p>
      </div>
    </section>
  )
}
