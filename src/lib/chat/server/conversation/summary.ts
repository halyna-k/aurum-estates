import "server-only";

import { formatDate, formatGbp } from "@/lib/format";
import { EMPLOYMENT_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/leads/labels";
import { bedroomsLabel } from "@/lib/property";
import type { LeadAnswers } from "@/types/lead";
import type { Property } from "@/types/property";
import { type AskedField, FIELD_ORDER, fieldSpec } from "@/lib/chat/server/answers/fields";
import { formatPhone } from "@/lib/chat/server/answers/parsers";
import { type Context, type Session, isSkipped } from "./session";

const yesNo = (value: boolean | undefined) =>
  value === undefined ? undefined : value ? "Yes" : "No";

const SHOW: Record<AskedField, (answers: Partial<LeadAnswers>) => string | undefined> = {
  fullName: (a) => a.fullName,
  email: (a) => a.email,
  phone: (a) => a.phone && formatPhone(a.phone),
  propertyType: (a) => a.propertyType && PROPERTY_TYPE_LABELS[a.propertyType],
  bedrooms: (a) => (a.bedrooms === undefined ? undefined : bedroomsLabel(a.bedrooms)),
  budget: (a) => (a.budget === undefined ? undefined : `${formatGbp(a.budget)} a month`),
  area: (a) => a.area,
  moveInDate: (a) => a.moveInDate && formatDate(a.moveInDate),
  employmentStatus: (a) => a.employmentStatus && EMPLOYMENT_LABELS[a.employmentStatus],
  annualIncome: (a) =>
    a.annualIncome === undefined ? undefined : `${formatGbp(a.annualIncome)} a year`,
  hasGuarantor: (a) => yesNo(a.hasGuarantor),
  occupants: (a) => a.occupants?.toString(),
  hasPets: (a) => yesNo(a.hasPets),
  viewingPreference: (a) => a.viewingPreference,
};

/** The details the applicant is asked to check, in question order. */
export function summaryFields(session: Session, ctx: Context): AskedField[] {
  return FIELD_ORDER.filter((key) => !isSkipped(session, key, ctx));
}

/** Plain lines built from validated data, never by the model. Skipped details say so. */
export function buildSummary(session: Session, ctx: Context, property?: Property): string {
  const rows = summaryFields(session, ctx).map((key): [string, string] => [
    fieldSpec(key).label,
    SHOW[key](session.answers) ?? "Not given",
  ]);

  if (property) rows.splice(FIELD_ORDER.indexOf("phone") + 1, 0, ["Property", property.address]);

  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}
