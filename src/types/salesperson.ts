export type UserRole = "owner" | "sales";

export interface Salesperson {
  id: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}
