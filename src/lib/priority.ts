import type { Lead } from "@/types/lead";

const temperatureRank: Record<Lead["temperature"], number> = {
  HOT: 4,
  WARM: 3,
  COOL: 2,
  COLD: 1
};

export function calculatePriorityScore(lead: Pick<Lead,
  | "totalScore"
  | "urgencyStatus"
  | "quotationStatus"
  | "siteSurveyStatus"
  | "riskFlags"
>): number {
  const urgencyBonus = lead.urgencyStatus === "within_1_month" ? 10 : 0;
  const quotationBonus = lead.quotationStatus === "quoted_and_price_accepted" ? 10 : 0;
  const surveyBonus = lead.siteSurveyStatus === "scheduled_easy_site" ? 8 : lead.siteSurveyStatus === "scheduled_difficult_site" ? 4 : 0;
  const riskPenalty = lead.riskFlags.reduce((sum, risk) => {
    const penalties = {
      no_site_photo: 5,
      no_response: 15,
      price_rejected: 10,
      far_location: 5,
      difficult_installation: 4,
      no_site_survey: 3,
      timeline_unclear: 5
    };
    return sum + penalties[risk];
  }, 0);

  return Math.max(0, lead.totalScore + urgencyBonus + quotationBonus + surveyBonus - riskPenalty);
}

export function generatePriorityCallList(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const temperatureDiff = temperatureRank[b.temperature] - temperatureRank[a.temperature];
    if (temperatureDiff !== 0) return temperatureDiff;
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
