import { describe, expect, it } from "vitest";
import { buildScoredLead } from "@/lib/leadFactory";
import { generatePriorityCallList } from "@/lib/priority";
import type { LeadInput } from "@/types/lead";

const base: LeadInput = {
  customerName: "Lead",
  phoneNumber: "0811111111",
  installationLocationType: "bangkok_metropolitan",
  projectValueLevel: "mid_high_4m_to_6m",
  sitePhotoStatus: "photo_without_measurement",
  urgencyStatus: "within_3_months",
  quotationStatus: "quoted_but_hesitating",
  communicationStatus: "partially_responsive",
  siteSurveyStatus: "not_scheduled"
};

describe("priority", () => {
  it("pushes HOT leads above lower temperature leads", () => {
    const hot = buildScoredLead({
      ...base,
      customerName: "HOT",
      sitePhotoStatus: "detailed_with_measurement",
      urgencyStatus: "within_1_month",
      quotationStatus: "quoted_and_price_accepted",
      communicationStatus: "highly_responsive",
      siteSurveyStatus: "scheduled_easy_site"
    });
    const warm = buildScoredLead({ ...base, customerName: "WARM" });
    const list = generatePriorityCallList([warm, hot]);
    expect(list[0].customerName).toBe("HOT");
  });

  it("penalizes no response in priority score", () => {
    const responsive = buildScoredLead({ ...base, customerName: "ตอบไว" });
    const quiet = buildScoredLead({ ...base, customerName: "ไม่ตอบ", communicationStatus: "unresponsive" });
    expect(responsive.priorityScore).toBeGreaterThan(quiet.priorityScore);
  });
});
