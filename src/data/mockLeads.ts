import type { LeadInput } from "@/types/lead";
import { buildScoredLead } from "@/lib/leadFactory";

const inputs: LeadInput[] = [
  {
    customerName: "คุณวิภา",
    phoneNumber: "081-111-2222",
    lineId: "wipa.home",
    province: "กรุงเทพ",
    district: "ลาดพร้าว",
    projectName: "บ้านเดี่ยวลาดพร้าว",
    leadSource: "Line",
    salesOwner: "แอน",
    customerNote: "ส่งรูปพร้อมขนาด 4.5 x 3 เมตร รับราคาได้ ต้องการนัดวัดพื้นที่",
    installationLocationType: "bangkok_metropolitan",
    projectValueLevel: "luxury_over_6m",
    sitePhotoStatus: "detailed_with_measurement",
    urgencyStatus: "within_1_month",
    quotationStatus: "quoted_and_price_accepted",
    communicationStatus: "highly_responsive",
    siteSurveyStatus: "scheduled_easy_site"
  },
  {
    customerName: "คุณณัฐพล",
    phoneNumber: "081-457-9214",
    lineId: "nara1479",
    province: "ปทุมธานี",
    district: "ลำลูกกา",
    projectName: "เดอะเบส ลำลูกกา คลอง 6",
    leadSource: "Facebook",
    salesOwner: "แอน",
    customerNote: "ไม่แน่ใจเรื่องขนาด จอดรถได้ 2 คัน ให้เสนอราคาและสเปคแต่ละรุ่นในไลน์",
    installationLocationType: "bangkok_metropolitan",
    projectValueLevel: "mid_high_4m_to_6m",
    sitePhotoStatus: "photo_without_measurement",
    urgencyStatus: "within_3_months",
    quotationStatus: "quoted_but_hesitating",
    communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    customerName: "คุณชนินทร์",
    phoneNumber: "085-963-3699",
    province: "กรุงเทพ",
    district: "ดินแดง",
    leadSource: "Facebook",
    salesOwner: "แอน",
    customerNote: "ต้องการติดหน้าออฟฟิศขนาดประมาณ 2.5 x 2 ขอราคารุ่น Luxury และ Classic ไฟฟ้า",
    installationLocationType: "bangkok_metropolitan",
    projectValueLevel: "mid_high_4m_to_6m",
    sitePhotoStatus: "photo_without_measurement",
    urgencyStatus: "within_3_months",
    quotationStatus: "quoted_but_hesitating",
    communicationStatus: "highly_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    customerName: "คุณกัสจัง",
    phoneNumber: "091-232-8381",
    province: "ฉะเชิงเทรา",
    leadSource: "Facebook",
    salesOwner: "แอน",
    customerNote: "ขอราคาขนาด 4 x 2 เปรียบเทียบกับกันสาดถาวร แจ้งราคาสูงเกินงบ",
    installationLocationType: "near_bangkok_under_200km",
    projectValueLevel: "unknown",
    sitePhotoStatus: "photo_without_measurement",
    urgencyStatus: "just_researching",
    quotationStatus: "quoted_but_price_rejected",
    communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    customerName: "คุณผึ้ง",
    phoneNumber: "088-222-3333",
    province: "นนทบุรี",
    district: "เมืองนนทบุรี",
    leadSource: "Call",
    salesOwner: "แอน",
    customerNote: "ทีมช่างวัดหน้างานแล้ว สนใจรุ่น Grand ต้องการสรุปใบเสนอราคา",
    installationLocationType: "bangkok_metropolitan",
    projectValueLevel: "luxury_over_6m",
    sitePhotoStatus: "detailed_with_measurement",
    urgencyStatus: "within_1_month",
    quotationStatus: "quoted_but_hesitating",
    communicationStatus: "highly_responsive",
    siteSurveyStatus: "scheduled_easy_site"
  },
  {
    customerName: "คุณชัยภูมิ",
    phoneNumber: "095-619-2542",
    province: "ชัยภูมิ",
    leadSource: "Facebook",
    salesOwner: "แอน",
    customerNote: "ต้องการติดพื้นที่ด้านข้างบ้านชั้นเดียว ยังไม่แน่ใจขนาด และจะไปต่างประเทศ 3 อาทิตย์",
    installationLocationType: "far_over_300km",
    projectValueLevel: "unknown",
    sitePhotoStatus: "not_sent",
    urgencyStatus: "unknown",
    quotationStatus: "not_quoted",
    communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    customerName: "คุณเอก",
    phoneNumber: "086-461-8345",
    province: "นนทบุรี",
    projectName: "บ้านใหม่",
    leadSource: "Line",
    salesOwner: "เมย์",
    customerNote: "บ้านยังไม่เสร็จ ส่งรายละเอียดให้แฟนไปแล้ว ยังดูนิ่งอยู่",
    installationLocationType: "bangkok_metropolitan",
    projectValueLevel: "mid_high_4m_to_6m",
    sitePhotoStatus: "photo_without_measurement",
    urgencyStatus: "just_researching",
    quotationStatus: "not_quoted",
    communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    customerName: "คุณสระบุรี",
    phoneNumber: "096-010-7498",
    province: "สระบุรี",
    leadSource: "Line",
    salesOwner: "แอน",
    customerNote: "ติดราคา แฟนยังไม่ให้ทำ",
    installationLocationType: "near_bangkok_under_200km",
    projectValueLevel: "below_4m",
    sitePhotoStatus: "not_sent",
    urgencyStatus: "just_researching",
    quotationStatus: "quoted_but_price_rejected",
    communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    customerName: "คุณระยอง",
    phoneNumber: "080-392-8218",
    province: "ระยอง",
    leadSource: "Facebook",
    salesOwner: "แอน",
    customerNote: "ต้องการติดหน้าบ้าน 3 x 2.5 ขอให้ทีมช่างเข้าตรวจพื้นที่ก่อนแบบไม่มีค่าใช้จ่าย",
    installationLocationType: "near_bangkok_under_200km",
    projectValueLevel: "unknown",
    sitePhotoStatus: "photo_without_measurement",
    urgencyStatus: "within_3_months",
    quotationStatus: "not_quoted",
    communicationStatus: "partially_responsive",
    siteSurveyStatus: "scheduled_difficult_site"
  },
  {
    customerName: "คุณไม่รับสาย",
    phoneNumber: "095-494-4244",
    province: "ระยอง",
    leadSource: "Line",
    salesOwner: "แอน",
    customerNote: "โทรแล้วไม่รับสาย แอดไลน์แล้วรอตอบกลับ",
    installationLocationType: "near_bangkok_under_200km",
    projectValueLevel: "unknown",
    sitePhotoStatus: "not_sent",
    urgencyStatus: "unknown",
    quotationStatus: "not_quoted",
    communicationStatus: "unresponsive",
    siteSurveyStatus: "not_scheduled"
  }
];

export const mockLeads = inputs.map((input, index) => {
  const lead = buildScoredLead(input, {
    id: `mock-${index + 1}`,
    createdAt: new Date(Date.UTC(2026, 0, index + 1, 3, 0, 0)).toISOString()
  });
  return {
    ...lead,
    updatedAt: new Date(Date.UTC(2026, 0, index + 10, 3, 0, 0)).toISOString()
  };
});
