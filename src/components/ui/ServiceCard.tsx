import { Reveal } from "./Reveal";
import ServiceIcon from "./ServiceIcon";
import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <li className="bg-surface">
      <Reveal delayMs={index * 120} className="h-full px-8 py-10">
        <span className="mb-6 grid size-11 place-items-center border border-line text-brand">
          <ServiceIcon name={service.icon} />
        </span>
        <h3 className="mb-3 font-serif text-xl text-ink">{service.title}</h3>
        <p className="text-sm leading-[1.8] text-ink-secondary">{service.description}</p>
      </Reveal>
    </li>
  );
}
