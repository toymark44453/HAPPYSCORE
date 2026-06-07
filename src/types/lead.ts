export type LeadGrade = "A" | "B" | "C" | "D";

export type LeadTemperature = "HOT" | "WARM" | "COOL" | "COLD";

export type InstallationLocationType =
  | "bangkok_metropolitan"
  | "near_bangkok_under_200km"
  | "medium_distance_201_299km"
  | "far_over_300km"
  | "unknown";

export type ProjectValueLevel =
  | "luxury_over_6m"
  | "mid_high_4m_to_6m"
  | "below_4m"
  | "unknown";

export type SitePhotoStatus =
  | "detailed_with_measurement"
  | "photo_without_measurement"
  | "not_sent";

export type UrgencyStatus =
  | "within_1_month"
  | "within_3_months"
  | "just_researching"
  | "unknown";

export type QuotationStatus =
  | "quoted_and_price_accepted"
  | "quoted_but_hesitating"
  | "quoted_but_price_rejected"
  | "not_quoted";

export type CommunicationStatus =
  | "highly_responsive"
  | "partially_responsive"
  | "unresponsive";

export type SiteSurveyStatus =
  | "scheduled_easy_site"
  | "scheduled_difficult_site"
  | "not_scheduled";

export type LeadSegment =
  | "Ideal Customer"
  | "Nurture Target"
  | "Quick Win"
  | "Low Priority";

export type RiskFlag =
  | "no_site_photo"
  | "no_response"
  | "price_rejected"
  | "far_location"
  | "difficult_installation"
  | "no_site_survey"
  | "timeline_unclear";

export interface LeadInput {
  customerName: string;
  phoneNumber?: string;
  lineId?: string;
  province?: string;
  district?: string;
  installationAddress?: string;
  projectName?: string;
  leadSource?: string;
  salesOwner?: string;
  customerNote?: string;
  installationLocationType: InstallationLocationType;
  projectValueLevel: ProjectValueLevel;
  sitePhotoStatus: SitePhotoStatus;
  urgencyStatus: UrgencyStatus;
  quotationStatus: QuotationStatus;
  communicationStatus: CommunicationStatus;
  siteSurveyStatus: SiteSurveyStatus;
}

export interface Lead extends LeadInput {
  id: string;
  installationLocationScore: number;
  projectValueScore: number;
  sitePhotoScore: number;
  urgencyScore: number;
  quotationAcceptanceScore: number;
  communicationScore: number;
  siteSurveyScore: number;
  fitScore: number;
  interestScore: number;
  totalScore: number;
  priorityScore: number;
  grade: LeadGrade;
  temperature: LeadTemperature;
  segment: LeadSegment;
  riskFlags: RiskFlag[];
  scoringReasons: string[];
  recommendation: string;
  nextStep: string;
  createdAt: string;
  updatedAt: string;
}
