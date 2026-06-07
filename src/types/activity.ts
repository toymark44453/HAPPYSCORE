export type ActivityType = "call" | "line" | "visit" | "quote" | "note";

export const activityTypeLabels: Record<ActivityType, string> = {
  call: "โทรหา",
  line: "แชท Line",
  visit: "เข้าหน้างาน",
  quote: "ออกใบเสนอราคา",
  note: "บันทึก",
};

export const activityTypeIcons: Record<ActivityType, string> = {
  call: "📞",
  line: "💬",
  visit: "🏠",
  quote: "📋",
  note: "📝",
};

export interface ActivityEntry {
  id: string;
  leadId: string;
  type: ActivityType;
  note: string;
  createdAt: string;
  createdBy?: string;
}
