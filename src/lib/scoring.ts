import type {
  CommunicationStatus,
  InstallationLocationType,
  LeadInput,
  ProjectValueLevel,
  QuotationStatus,
  RiskFlag,
  SitePhotoStatus,
  SiteSurveyStatus,
  UrgencyStatus
} from "@/types/lead";

export const locationLabels: Record<InstallationLocationType, string> = {
  bangkok_metropolitan: "กรุงเทพ/ปริมณฑล",
  near_bangkok_under_200km: "ต่างจังหวัดไม่เกิน 200 km",
  medium_distance_201_299km: "ระยะทาง 201-299 km",
  far_over_300km: "ระยะทาง 300 km ขึ้นไป",
  unknown: "ไม่ทราบพื้นที่"
};

export const projectValueLabels: Record<ProjectValueLevel, string> = {
  luxury_over_6m: "บ้าน/โครงการ 6 ล้านบาทขึ้นไป",
  mid_high_4m_to_6m: "บ้าน/โครงการ 4-6 ล้านบาท",
  below_4m: "บ้าน/โครงการต่ำกว่า 4 ล้านบาท",
  unknown: "ไม่พบข้อมูลมูลค่าโครงการ"
};

export const sitePhotoLabels: Record<SitePhotoStatus, string> = {
  detailed_with_measurement: "ส่งรูปละเอียดพร้อมขนาด",
  photo_without_measurement: "ส่งรูปแต่ไม่มีขนาด หรือมีขนาดแต่ยังไม่มีรูป",
  not_sent: "ยังไม่ส่งรูป/ข้อมูลหน้างาน"
};

export const urgencyLabels: Record<UrgencyStatus, string> = {
  within_1_month: "ต้องการติดตั้งภายใน 1 เดือน",
  within_3_months: "ต้องการติดตั้งภายใน 3 เดือน",
  just_researching: "สอบถามไว้ก่อน/ดูข้อมูลก่อน",
  unknown: "ไม่ทราบกำหนดติดตั้ง"
};

export const quotationLabels: Record<QuotationStatus, string> = {
  quoted_and_price_accepted: "ออกใบเสนอราคาแล้ว และลูกค้ารับราคาได้",
  quoted_but_hesitating: "ออกใบเสนอราคาแล้ว แต่ลูกค้ายังลังเล",
  quoted_but_price_rejected: "ออกใบเสนอราคาแล้ว แต่ลูกค้ารับราคาไม่ได้",
  not_quoted: "ยังไม่ได้ออกใบเสนอราคา"
};

export const communicationLabels: Record<CommunicationStatus, string> = {
  highly_responsive: "รับสาย/ตอบ Line สม่ำเสมอ",
  partially_responsive: "รับบ้าง ตอบบ้าง",
  unresponsive: "ไม่รับสาย/ไม่ตอบ Line"
};

export const siteSurveyLabels: Record<SiteSurveyStatus, string> = {
  scheduled_easy_site: "รับนัด และพื้นที่ติดตั้งง่าย",
  scheduled_difficult_site: "รับนัด แต่พื้นที่ติดตั้งยาก/มีงานเสริม",
  not_scheduled: "ยังไม่รับนัดวัดพื้นที่"
};

export const riskFlagLabels: Record<RiskFlag, string> = {
  no_site_photo: "ยังไม่มีรูปหรือข้อมูลหน้างานชัดเจน",
  no_response: "ลูกค้าไม่ตอบหรือไม่รับสาย",
  price_rejected: "ลูกค้าติดราคา/รับราคาไม่ได้",
  far_location: "พื้นที่ติดตั้งไกลมาก",
  difficult_installation: "หน้างานติดตั้งยากหรือมีงานเสริม",
  no_site_survey: "ยังไม่ได้นัดวัดพื้นที่",
  timeline_unclear: "กำหนดติดตั้งยังไม่ชัดเจน"
};

export function calculateInstallationLocationScore(value: InstallationLocationType): number {
  const scores: Record<InstallationLocationType, number> = {
    bangkok_metropolitan: 20,
    near_bangkok_under_200km: 10,
    medium_distance_201_299km: 7,
    far_over_300km: 5,
    unknown: 0
  };
  return scores[value];
}

export function calculateProjectValueScore(value: ProjectValueLevel): number {
  const scores: Record<ProjectValueLevel, number> = {
    luxury_over_6m: 10,
    mid_high_4m_to_6m: 7,
    below_4m: 4,
    unknown: 5
  };
  return scores[value];
}

export function calculateSitePhotoScore(value: SitePhotoStatus): number {
  const scores: Record<SitePhotoStatus, number> = {
    detailed_with_measurement: 10,
    photo_without_measurement: 5,
    not_sent: 0
  };
  return scores[value];
}

export function calculateUrgencyScore(value: UrgencyStatus): number {
  const scores: Record<UrgencyStatus, number> = {
    within_1_month: 20,
    within_3_months: 10,
    just_researching: 5,
    unknown: 0
  };
  return scores[value];
}

export function calculateQuotationAcceptanceScore(value: QuotationStatus): number {
  const scores: Record<QuotationStatus, number> = {
    quoted_and_price_accepted: 20,
    quoted_but_hesitating: 10,
    quoted_but_price_rejected: 5,
    not_quoted: 0
  };
  return scores[value];
}

export function calculateCommunicationScore(value: CommunicationStatus): number {
  const scores: Record<CommunicationStatus, number> = {
    highly_responsive: 10,
    partially_responsive: 5,
    unresponsive: 0
  };
  return scores[value];
}

export function calculateSiteSurveyScore(value: SiteSurveyStatus): number {
  const scores: Record<SiteSurveyStatus, number> = {
    scheduled_easy_site: 10,
    scheduled_difficult_site: 5,
    not_scheduled: 0
  };
  return scores[value];
}

export function calculateScores(input: LeadInput) {
  const installationLocationScore = calculateInstallationLocationScore(input.installationLocationType);
  const projectValueScore = calculateProjectValueScore(input.projectValueLevel);
  const sitePhotoScore = calculateSitePhotoScore(input.sitePhotoStatus);
  const urgencyScore = calculateUrgencyScore(input.urgencyStatus);
  const quotationAcceptanceScore = calculateQuotationAcceptanceScore(input.quotationStatus);
  const communicationScore = calculateCommunicationScore(input.communicationStatus);
  const siteSurveyScore = calculateSiteSurveyScore(input.siteSurveyStatus);
  const fitScore = installationLocationScore + projectValueScore + siteSurveyScore;
  const interestScore = sitePhotoScore + urgencyScore + quotationAcceptanceScore + communicationScore;
  const totalScore = fitScore + interestScore;

  return {
    installationLocationScore,
    projectValueScore,
    sitePhotoScore,
    urgencyScore,
    quotationAcceptanceScore,
    communicationScore,
    siteSurveyScore,
    fitScore,
    interestScore,
    totalScore
  };
}

export function generateRiskFlags(input: LeadInput): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (input.sitePhotoStatus === "not_sent") flags.push("no_site_photo");
  if (input.communicationStatus === "unresponsive") flags.push("no_response");
  if (input.quotationStatus === "quoted_but_price_rejected") flags.push("price_rejected");
  if (input.installationLocationType === "far_over_300km") flags.push("far_location");
  if (input.siteSurveyStatus === "scheduled_difficult_site") flags.push("difficult_installation");
  if (input.siteSurveyStatus === "not_scheduled") flags.push("no_site_survey");
  if (input.urgencyStatus === "unknown") flags.push("timeline_unclear");
  return flags;
}

export function generateScoringReasons(input: LeadInput): string[] {
  const scores = calculateScores(input);
  return [
    `${locationLabels[input.installationLocationType]} ได้ ${scores.installationLocationScore} คะแนน`,
    `${projectValueLabels[input.projectValueLevel]} ได้ ${scores.projectValueScore} คะแนน`,
    `${sitePhotoLabels[input.sitePhotoStatus]} ได้ ${scores.sitePhotoScore} คะแนน`,
    `${urgencyLabels[input.urgencyStatus]} ได้ ${scores.urgencyScore} คะแนน`,
    `${quotationLabels[input.quotationStatus]} ได้ ${scores.quotationAcceptanceScore} คะแนน`,
    `${communicationLabels[input.communicationStatus]} ได้ ${scores.communicationScore} คะแนน`,
    `${siteSurveyLabels[input.siteSurveyStatus]} ได้ ${scores.siteSurveyScore} คะแนน`
  ];
}
