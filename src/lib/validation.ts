import type { LeadInput } from "@/types/lead";

export function validateLeadInput(input: LeadInput): string[] {
  const errors: string[] = [];
  if (!input.customerName.trim()) errors.push("ต้องมีชื่อลูกค้า");
  if (!input.phoneNumber?.trim() && !input.lineId?.trim()) errors.push("ต้องมีอย่างน้อยเบอร์โทรหรือ Line ID");
  return errors;
}
