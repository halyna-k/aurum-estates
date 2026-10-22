export const SERVICE_ICONS = ["home", "key", "message"] as const;
export type ServiceIconName = (typeof SERVICE_ICONS)[number];

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: ServiceIconName;
}
