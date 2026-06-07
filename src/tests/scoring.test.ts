import { describe, expect, it } from "vitest";
import { buildScoredLead } from "@/lib/leadFactory";
import { generateRiskFlags } from "@/lib/scoring";
import type { LeadInput } from "@/types/lead";

const hotInput: LeadInput = {
  customerName: "คุณทดสอบ",
  phoneNumber: "0811111111",
  installationLocationType: "bangkok_metropolitan",
  projectValueLevel: "luxury_over_6m",
  sitePhotoStatus: "detailed_with_measurement",
  urgencyStatus: "within_1_month",
  quotationStatus: "quoted_and_price_accepted",
  communicationStatus: "highly_responsive",
  siteSurveyStatus: "scheduled_easy_site"
};

describe("scoring", () => {
  it("calculates category, fit, interest, and total scores correctly", () => {
    const lead = buildScoredLead(hotInput);
    expect(lead.installationLocationScore).toBe(20);
    expect(lead.projectValueScore).toBe(10);
    expect(lead.sitePhotoScore).toBe(10);
    expect(lead.urgencyScore).toBe(20);
    expect(lead.quotationAcceptanceScore).toBe(20);
    expect(lead.communicationScore).toBe(10);
    expect(lead.siteSurveyScore).toBe(10);
    expect(lead.fitScore).toBe(40);
    expect(lead.interestScore).toBe(60);
    expect(lead.totalScore).toBe(100);
  });

  it("generates required risk flags", () => {
    const flags = generateRiskFlags({
      ...hotInput,
      sitePhotoStatus: "not_sent",
      communicationStatus: "unresponsive",
      quotationStatus: "quoted_but_price_rejected",
      installationLocationType: "far_over_300km",
      siteSurveyStatus: "scheduled_difficult_site",
      urgencyStatus: "unknown"
    });
    expect(flags).toEqual([
      "no_site_photo",
      "no_response",
      "price_rejected",
      "far_location",
      "difficult_installation",
      "timeline_unclear"
    ]);
  });

  it("always includes scoring reasons and next step with a scored lead", () => {
    const lead = buildScoredLead(hotInput);
    expect(lead.scoringReasons).toHaveLength(7);
    expect(lead.recommendation.length).toBeGreaterThan(0);
    expect(lead.nextStep.length).toBeGreaterThan(0);
  });
});
