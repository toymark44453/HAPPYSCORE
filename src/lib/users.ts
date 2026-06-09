import type { Salesperson } from "@/types/salesperson";

export const SALESPEOPLE: Salesperson[] = [
  { id: "owner_01", name: "เจ้าของ", role: "owner", isActive: true },
  { id: "sales_01", name: "เซลล์ 1",  role: "sales", isActive: true },
  { id: "sales_02", name: "เซลล์ 2",  role: "sales", isActive: true },
  { id: "sales_03", name: "เซลล์ 3",  role: "sales", isActive: true },
  { id: "sales_04", name: "เซลล์ 4",  role: "sales", isActive: true },
];

const CURRENT_USER_KEY = "happy_current_user";

export function getAllUsers(): Salesperson[] {
  return SALESPEOPLE;
}

export function getSalespeople(): Salesperson[] {
  return SALESPEOPLE.filter((u) => u.role === "sales");
}

export function getUserById(id: string): Salesperson | undefined {
  return SALESPEOPLE.find((u) => u.id === id);
}

export function isOwner(id: string): boolean {
  return getUserById(id)?.role === "owner";
}

export function isSalesperson(id: string): boolean {
  return getUserById(id)?.role === "sales";
}

export function getCurrentUser(): Salesperson {
  if (typeof window === "undefined") return SALESPEOPLE[0];
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return getUserById(stored ?? "") ?? SALESPEOPLE[0];
}

export function setCurrentUser(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_USER_KEY, id);
}
