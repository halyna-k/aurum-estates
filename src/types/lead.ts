export interface LeadData {
  fullName?: string;
  email?: string;
  phone?: string;
  propertyType?: string;   // studio | 1bed | 2bed | 3bed+
  budget?: number;         // monthly £
  area?: string;
  moveInDate?: string;
  tenancyLength?: string;  // 6m | 12m | flexible
  employmentStatus?: string;
  annualIncome?: number;
  rightToRent?: string;    // uk_national | eu_settled | visa | unknown
  guarantor?: boolean;
  qualificationScore?: number;
  occupants?: number;
  pets?: boolean;
  status:
    | "new"
    | "qualified"
    | "viewing"
    | "completed";
}
