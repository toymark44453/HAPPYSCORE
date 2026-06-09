import type { Lead } from "@/types/lead";

function esc(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportLeadsToCsv(leads: Lead[], filename = "happy-leads.csv"): void {
  const headers = [
    "ชื่อลูกค้า",
    "เบอร์โทร",
    "Line ID",
    "จังหวัด",
    "เขต/อำเภอ",
    "โครงการ",
    "ช่องทาง",
    "เซลล์ผู้ดูแล",
    "Pipeline Stage",
    "คะแนนรวม",
    "Fit Score",
    "Interest Score",
    "Priority Score",
    "Grade",
    "Temperature",
    "Segment",
    "สถานที่ติดตั้ง",
    "มูลค่าโครงการ",
    "รูปหน้างาน",
    "ความเร่งด่วน",
    "ใบเสนอราคา",
    "การสื่อสาร",
    "นัดวัดพื้นที่",
    "Next Step",
    "Risk Flags",
    "Note ลูกค้า",
    "วันที่สร้าง",
    "อัปเดตล่าสุด",
  ];

  const rows = leads.map((lead) => [
    esc(lead.customerName),
    esc(lead.phoneNumber),
    esc(lead.lineId),
    esc(lead.province),
    esc(lead.district),
    esc(lead.projectName),
    esc(lead.leadSource),
    esc(lead.salesOwner),
    esc(lead.pipelineStage),
    esc(lead.totalScore),
    esc(lead.fitScore),
    esc(lead.interestScore),
    esc(lead.priorityScore),
    esc(lead.grade),
    esc(lead.temperature),
    esc(lead.segment),
    esc(lead.installationLocationType),
    esc(lead.projectValueLevel),
    esc(lead.sitePhotoStatus),
    esc(lead.urgencyStatus),
    esc(lead.quotationStatus),
    esc(lead.communicationStatus),
    esc(lead.siteSurveyStatus),
    esc(lead.nextStep),
    esc(lead.riskFlags.join(" | ")),
    esc(lead.customerNote),
    esc(lead.createdAt),
    esc(lead.updatedAt),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const bom = "﻿"; // UTF-8 BOM สำหรับ Excel ภาษาไทย
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
