import type { LeadTemperature, RiskFlag } from "@/types/lead";

export function generateRecommendation(temperature: LeadTemperature, riskFlags: RiskFlag[]): string {
  const riskNote = riskFlags.length > 0 ? " พร้อมเคลียร์ความเสี่ยงที่ยังค้างอยู่" : "";
  if (temperature === "HOT") {
    return `ลูกค้าร้อน มีโอกาสปิดการขายสูง ควรติดตามทันที${riskNote}`;
  }
  if (temperature === "WARM") {
    return `ลูกค้าสนใจจริง แต่ยังต้องช่วยตัดสินใจ ควร follow-up เร็ว${riskNote}`;
  }
  if (temperature === "COOL") {
    return `ลูกค้ายังอยู่ช่วงรับข้อมูล ควร nurture และขอข้อมูลที่ขาด${riskNote}`;
  }
  return `ลูกค้ายังไม่พร้อมซื้อ ควรเก็บไว้ในฐานข้อมูลและติดตามเป็นรอบ${riskNote}`;
}

export function generateNextStep(temperature: LeadTemperature, riskFlags: RiskFlag[]): string {
  if (temperature === "HOT") {
    if (riskFlags.includes("no_site_survey")) return "โทรวันนี้เพื่อปิดนัดวัดพื้นที่ และเสนอช่วงวันติดตั้งเบื้องต้น";
    if (riskFlags.includes("price_rejected")) return "ให้หัวหน้าทีมช่วยคุย value selling และยืนยันกรอบราคาที่ลูกค้ารับได้";
    return "โทรภายใน 24 ชั่วโมง เพื่อยืนยันใบเสนอราคา นัดวัดพื้นที่ หรือปิดมัดจำ";
  }
  if (temperature === "WARM") {
    if (riskFlags.includes("no_site_photo")) return "Follow-up ภายใน 48 ชั่วโมง ขอรูปหน้างานและขนาดพื้นที่ให้ครบ";
    if (riskFlags.includes("price_rejected")) return "ส่งรีวิว ผลงาน และอธิบายความต่างจากกันสาดถาวรหรือช่างราคาถูก";
    return "Follow-up ภายใน 48 ชั่วโมง ส่งผลงานติดตั้งและดันไปสู่การนัดวัดพื้นที่";
  }
  if (temperature === "COOL") {
    return "ส่งแคตตาล็อก ราคาเริ่มต้น และผลงานติดตั้ง แล้ว follow-up ภายใน 1 สัปดาห์";
  }
  return "เข้า auto-nurture หรือเก็บไว้ใน database ตรวจเดือนละครั้งเท่านั้น";
}
