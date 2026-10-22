import Reveal from "@/components/ui/Reveal";
import ServiceIcon from "./ServiceIcon";
import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <li>
      <Reveal
        delayMs={index * 120}
        className="h-full rounded-xl border border-line bg-surface p-4 lg:p-6"
      >
        <span className="mb-6 grid size-11 place-items-center rounded-lg border border-line text-brand">
          <ServiceIcon name={service.icon} />
        </span>
        <h3 className="mb-3 font-serif text-xl text-ink">{service.title}</h3>
        <p className="text-sm leading-relaxed text-ink-secondary">{service.description}</p>
      </Reveal>
    </li>
  );
}
