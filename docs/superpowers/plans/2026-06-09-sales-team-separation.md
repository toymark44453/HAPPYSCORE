# Sales Team Separation + Owner Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** แยกข้อมูล Lead ตามพนักงานขาย 4 คน และเพิ่มหน้า /team Dashboard รวมสำหรับเจ้าของ

**Architecture:** ใช้ Supabase เป็น backend เดิม (ต่อยอดจาก storage.ts + snapshotStorage.ts) โดยเพิ่ม column `sales_owner_id` ใน leads table ด้วย SQL migration ใน Supabase Dashboard · Salesperson registry เก็บใน code (static list) · Current user selector เก็บใน localStorage · Filtering ทำฝั่ง client หลัง load จาก Supabase

**Tech Stack:** Next.js 16, TypeScript, Supabase (postgres), Vitest, localStorage (currentUser only)

---

## Important Context

- **Backend**: Supabase — `loadLeads()`, `upsertLead()`, `deleteLead()` ใน `src/lib/storage.ts` ใช้ supabase client
- **salesOwner field**: มีอยู่แล้วเป็น `string` (ชื่อข้อความ) ใน Lead type — ต้องเพิ่ม `salesOwnerId` เป็น field ใหม่โดยไม่ลบ `salesOwner` เดิม
- **SalesOwnerPerformance**: มีอยู่แล้วใน `src/lib/performance.ts` — group by salesOwner string
- **Pending SQL migrations** (ยังไม่ได้รัน): pipeline_stage + จะเพิ่ม sales_owner_id ในงานนี้
- **Test framework**: Vitest ใช้ `describe / it / expect` — ดูตัวอย่างใน `src/tests/performance.test.ts`

---

## File Structure — สิ่งที่จะสร้างหรือแก้ไข

### Files ใหม่
```
src/types/salesperson.ts              — Salesperson + UserRole types
src/lib/users.ts                      — static registry + localStorage getCurrentUser/setCurrentUser
src/lib/teamMetrics.ts                — calculateTeamMetrics, calculateSalespersonSummary, calculateLeadDistributionBySalesperson
src/lib/visibilityFilter.ts           — getVisibleLeadsForUser, filterLeadsBySalesOwner
src/components/CurrentUserSelector.tsx — UI dropdown เลือก sales / owner
src/components/TeamKpiCards.tsx        — KPI cards สำหรับ /team
src/components/SalespersonSummaryTable.tsx   — ตาราง performance แยกตามเซลล์
src/components/SalespersonDistributionTable.tsx — ตาราง A/B/C/D แยกตามเซลล์
src/app/team/page.tsx                 — หน้า Owner/Team Dashboard
src/tests/teamMetrics.test.ts         — unit tests สำหรับ teamMetrics + visibilityFilter
```

### Files ที่แก้ไข
```
src/types/lead.ts                     — เพิ่ม salesOwnerId?, salesOwnerName? ใน LeadInput + Lead
src/lib/storage.ts                    — เพิ่ม sales_owner_id ใน rowToLead + leadToRow
src/data/mockLeads.ts                 — เพิ่ม salesOwnerId กระจาย 4 คน, อย่างน้อย 10 leads
src/components/LeadForm.tsx           — salesOwner field เปลี่ยนเป็น dropdown + auto-assign salesOwnerId
src/components/LeadTable.tsx          — เพิ่ม column "ผู้รับผิดชอบ"
src/app/page.tsx                      — เพิ่ม CurrentUserSelector + filter leads ตาม currentUser
src/app/leads/new/page.tsx            — ส่ง currentUser ไปให้ LeadForm
src/app/performance/page.tsx          — filter ตาม currentUser ถ้าเป็น sales
```

---

## Task 1: Supabase SQL Migrations

> ทำก่อนทุก task เพราะ code ต้องการ column เหล่านี้ใน DB

**Files:**
- Manual step: Supabase SQL Editor at https://supabase.com/dashboard/project/cnksgyyuykughllmmpgw/sql

- [ ] **Step 1: รัน SQL ต่อไปนี้ใน Supabase SQL Editor**

```sql
-- เพิ่ม pipeline_stage (ยังค้างอยู่จาก session ก่อน)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new' 
CHECK (pipeline_stage IN ('new','contacted','quoted','won','lost'));

-- เพิ่ม sales_owner_id สำหรับ feature ใหม่
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS sales_owner_id TEXT;
```

- [ ] **Step 2: Verify ใน Supabase Table Editor**

เปิด https://supabase.com/dashboard/project/cnksgyyuykughllmmpgw/editor
ดูตาราง leads ว่ามี column `pipeline_stage` และ `sales_owner_id` แล้ว

---

## Task 2: Salesperson Types + Registry

**Files:**
- Create: `src/types/salesperson.ts`
- Create: `src/lib/users.ts`

- [ ] **Step 1: สร้าง `src/types/salesperson.ts`**

```typescript
export type UserRole = "owner" | "sales";

export interface Salesperson {
  id: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}
```

- [ ] **Step 2: สร้าง `src/lib/users.ts`**

```typescript
import type { Salesperson } from "@/types/salesperson";

export const SALESPEOPLE: Salesperson[] = [
  { id: "owner_01", name: "เจ้าของ",  role: "owner", isActive: true },
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
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mark/Desktop/HAPPYSCORE
git init 2>/dev/null || true
git add src/types/salesperson.ts src/lib/users.ts
git commit -m "feat: add Salesperson type and user registry"
```

---

## Task 3: เพิ่ม salesOwnerId ใน Lead Type + Storage

**Files:**
- Modify: `src/types/lead.ts`
- Modify: `src/lib/storage.ts`

- [ ] **Step 1: แก้ `src/types/lead.ts` — เพิ่ม fields ใน LeadInput**

ใน interface `LeadInput` ต่อจาก `salesOwner?: string;` เพิ่ม:
```typescript
  salesOwnerId?: string;
  salesOwnerName?: string;
```

- [ ] **Step 2: แก้ `src/types/lead.ts` — ตรวจว่า Lead interface extend LeadInput แล้วมี fields ใหม่โดยอัตโนมัติ**

ไม่ต้องแก้ `Lead` interface เพราะมัน `extends LeadInput` อยู่แล้ว fields จะถ่ายทอดมาเอง

- [ ] **Step 3: แก้ `src/lib/storage.ts` — rowToLead เพิ่ม sales_owner_id**

ใน function `rowToLead` ต่อจาก `salesOwner: row.sales_owner as string | undefined,` เพิ่ม:
```typescript
    salesOwnerId: row.sales_owner_id as string | undefined,
    salesOwnerName: row.sales_owner_name as string | undefined,
```

- [ ] **Step 4: แก้ `src/lib/storage.ts` — leadToRow เพิ่ม sales_owner_id**

ใน function `leadToRow` ต่อจาก `sales_owner: lead.salesOwner ?? null,` เพิ่ม:
```typescript
    sales_owner_id: lead.salesOwnerId ?? null,
    sales_owner_name: lead.salesOwnerName ?? null,
```

> Note: `sales_owner_name` ไม่มีใน DB schema แต่ Supabase จะ ignore column ที่ไม่มี ถ้ากังวลให้ตัดออกจาก leadToRow ได้ แต่ไว้ใน rowToLead เพื่อรองรับอนาคต ทางที่ปลอดภัยกว่าคือ ไม่ส่ง sales_owner_name ไปยัง DB เลย แก้เป็น:

```typescript
// leadToRow — ไม่รวม sales_owner_name เพราะไม่มีใน DB schema
    sales_owner_id: lead.salesOwnerId ?? null,
```

- [ ] **Step 5: Commit**

```bash
git add src/types/lead.ts src/lib/storage.ts
git commit -m "feat: add salesOwnerId to Lead type and storage mapping"
```

---

## Task 4: Visibility Filter Logic

**Files:**
- Create: `src/lib/visibilityFilter.ts`

- [ ] **Step 1: สร้าง `src/lib/visibilityFilter.ts`**

```typescript
import type { Lead } from "@/types/lead";
import type { Salesperson } from "@/types/salesperson";

export function filterLeadsBySalesOwner(leads: Lead[], salesOwnerId: string): Lead[] {
  return leads.filter((lead) => lead.salesOwnerId === salesOwnerId);
}

export function getVisibleLeadsForUser(leads: Lead[], currentUser: Salesperson): Lead[] {
  if (currentUser.role === "owner") return leads;
  return filterLeadsBySalesOwner(leads, currentUser.id);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/visibilityFilter.ts
git commit -m "feat: add visibility filter logic for sales/owner roles"
```

---

## Task 5: Team Metrics Logic

**Files:**
- Create: `src/lib/teamMetrics.ts`

- [ ] **Step 1: สร้าง `src/lib/teamMetrics.ts`**

```typescript
import type { Lead } from "@/types/lead";
import type { LeadScoreSnapshot } from "@/types/performance";
import type { Salesperson } from "@/types/salesperson";

export interface TeamMetrics {
  totalLeads: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  hotLeads: number;
  warmLeads: number;
  coolLeads: number;
  coldLeads: number;
  averageScore: number;
  totalPriorityLeads: number;
  cToA: number;
  cToARate: number;
  upgradeCount: number;
  downgradeCount: number;
}

export interface SalespersonSummary {
  salesOwnerId: string;
  salesOwnerName: string;
  totalLeads: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  hotLeads: number;
  warmLeads: number;
  coolLeads: number;
  coldLeads: number;
  averageScore: number;
  priorityLeads: number;
  cToA: number;
  cToB: number;
  bToA: number;
  upgradeRate: number;
  downgradeRate: number;
}

export interface SalespersonLeadDistribution {
  salesOwnerId: string;
  salesOwnerName: string;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  total: number;
}

function safeRate(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 100 * 10) / 10;
}

function getLeadBounds(snapshots: LeadScoreSnapshot[]) {
  const grouped = new Map<string, LeadScoreSnapshot[]>();
  for (const s of snapshots) {
    if (!grouped.has(s.leadId)) grouped.set(s.leadId, []);
    grouped.get(s.leadId)!.push(s);
  }
  const bounds = new Map<string, { first: LeadScoreSnapshot; latest: LeadScoreSnapshot }>();
  for (const [id, snaps] of grouped) {
    const sorted = [...snaps].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    bounds.set(id, { first: sorted[0], latest: sorted[sorted.length - 1] });
  }
  return bounds;
}

export function calculateTeamMetrics(leads: Lead[], snapshots: LeadScoreSnapshot[]): TeamMetrics {
  const bounds = getLeadBounds(snapshots);
  let cToA = 0, upgradeCount = 0, downgradeCount = 0;

  for (const [, { first, latest }] of bounds) {
    if (first.id === latest.id) continue;
    const fromIdx = { D: 0, C: 1, B: 2, A: 3 }[first.newGrade];
    const toIdx = { D: 0, C: 1, B: 2, A: 3 }[latest.newGrade];
    const diff = toIdx - fromIdx;
    if (diff > 0) upgradeCount++;
    if (diff < 0) downgradeCount++;
    if (first.newGrade === "C" && latest.newGrade === "A") cToA++;
  }

  const cLeads = leads.filter((l) => l.grade === "C").length;
  const avgScore =
    leads.length === 0
      ? 0
      : Math.round(leads.reduce((acc, l) => acc + l.totalScore, 0) / leads.length);

  return {
    totalLeads: leads.length,
    gradeA: leads.filter((l) => l.grade === "A").length,
    gradeB: leads.filter((l) => l.grade === "B").length,
    gradeC: leads.filter((l) => l.grade === "C").length,
    gradeD: leads.filter((l) => l.grade === "D").length,
    hotLeads: leads.filter((l) => l.temperature === "HOT").length,
    warmLeads: leads.filter((l) => l.temperature === "WARM").length,
    coolLeads: leads.filter((l) => l.temperature === "COOL").length,
    coldLeads: leads.filter((l) => l.temperature === "COLD").length,
    averageScore: avgScore,
    totalPriorityLeads: leads.filter((l) => l.temperature === "HOT" || l.temperature === "WARM").length,
    cToA,
    cToARate: safeRate(cToA, cLeads),
    upgradeCount,
    downgradeCount,
  };
}

export function calculateSalespersonSummary(
  leads: Lead[],
  snapshots: LeadScoreSnapshot[],
  salespeople: Salesperson[]
): SalespersonSummary[] {
  const bounds = getLeadBounds(snapshots);

  return salespeople
    .filter((s) => s.role === "sales")
    .map((sp) => {
      const myLeads = leads.filter((l) => l.salesOwnerId === sp.id);
      const myLeadIds = new Set(myLeads.map((l) => l.id));

      let cToA = 0, cToB = 0, bToA = 0, upgradeCount = 0, downgradeCount = 0;

      for (const [leadId, { first, latest }] of bounds) {
        if (!myLeadIds.has(leadId) || first.id === latest.id) continue;
        const fromIdx = { D: 0, C: 1, B: 2, A: 3 }[first.newGrade];
        const toIdx = { D: 0, C: 1, B: 2, A: 3 }[latest.newGrade];
        const diff = toIdx - fromIdx;
        if (diff > 0) upgradeCount++;
        if (diff < 0) downgradeCount++;
        if (first.newGrade === "C" && latest.newGrade === "A") cToA++;
        if (first.newGrade === "C" && latest.newGrade === "B") cToB++;
        if (first.newGrade === "B" && latest.newGrade === "A") bToA++;
      }

      const tracked = myLeads.length;
      const avgScore =
        myLeads.length === 0
          ? 0
          : Math.round(myLeads.reduce((acc, l) => acc + l.totalScore, 0) / myLeads.length);

      return {
        salesOwnerId: sp.id,
        salesOwnerName: sp.name,
        totalLeads: myLeads.length,
        gradeA: myLeads.filter((l) => l.grade === "A").length,
        gradeB: myLeads.filter((l) => l.grade === "B").length,
        gradeC: myLeads.filter((l) => l.grade === "C").length,
        gradeD: myLeads.filter((l) => l.grade === "D").length,
        hotLeads: myLeads.filter((l) => l.temperature === "HOT").length,
        warmLeads: myLeads.filter((l) => l.temperature === "WARM").length,
        coolLeads: myLeads.filter((l) => l.temperature === "COOL").length,
        coldLeads: myLeads.filter((l) => l.temperature === "COLD").length,
        averageScore: avgScore,
        priorityLeads: myLeads.filter((l) => l.temperature === "HOT" || l.temperature === "WARM").length,
        cToA,
        cToB,
        bToA,
        upgradeRate: safeRate(upgradeCount, tracked),
        downgradeRate: safeRate(downgradeCount, tracked),
      };
    });
}

export function calculateLeadDistributionBySalesperson(
  leads: Lead[],
  salespeople: Salesperson[]
): SalespersonLeadDistribution[] {
  return salespeople
    .filter((s) => s.role === "sales")
    .map((sp) => {
      const myLeads = leads.filter((l) => l.salesOwnerId === sp.id);
      return {
        salesOwnerId: sp.id,
        salesOwnerName: sp.name,
        gradeA: myLeads.filter((l) => l.grade === "A").length,
        gradeB: myLeads.filter((l) => l.grade === "B").length,
        gradeC: myLeads.filter((l) => l.grade === "C").length,
        gradeD: myLeads.filter((l) => l.grade === "D").length,
        total: myLeads.length,
      };
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/teamMetrics.ts
git commit -m "feat: add team metrics calculations"
```

---

## Task 6: Unit Tests — teamMetrics + visibilityFilter

**Files:**
- Create: `src/tests/teamMetrics.test.ts`

- [ ] **Step 1: สร้าง `src/tests/teamMetrics.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { getVisibleLeadsForUser, filterLeadsBySalesOwner } from "@/lib/visibilityFilter";
import {
  calculateTeamMetrics,
  calculateSalespersonSummary,
  calculateLeadDistributionBySalesperson,
} from "@/lib/teamMetrics";
import type { Lead } from "@/types/lead";
import type { Salesperson } from "@/types/salesperson";
import type { LeadScoreSnapshot } from "@/types/performance";

const baseLead: Lead = {
  id: "l1",
  customerName: "ทดสอบ",
  pipelineStage: "new",
  installationLocationType: "bangkok_metropolitan",
  projectValueLevel: "luxury_over_6m",
  sitePhotoStatus: "detailed_with_measurement",
  urgencyStatus: "within_1_month",
  quotationStatus: "quoted_and_price_accepted",
  communicationStatus: "highly_responsive",
  siteSurveyStatus: "scheduled_easy_site",
  installationLocationScore: 20,
  projectValueScore: 10,
  sitePhotoScore: 10,
  urgencyScore: 20,
  quotationAcceptanceScore: 20,
  communicationScore: 10,
  siteSurveyScore: 10,
  fitScore: 40,
  interestScore: 60,
  totalScore: 100,
  priorityScore: 100,
  grade: "A",
  temperature: "HOT",
  segment: "Ideal Customer",
  riskFlags: [],
  scoringReasons: [],
  recommendation: "",
  nextStep: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const owner: Salesperson = { id: "owner_01", name: "เจ้าของ", role: "owner", isActive: true };
const sales01: Salesperson = { id: "sales_01", name: "เซลล์ 1", role: "sales", isActive: true };
const sales02: Salesperson = { id: "sales_02", name: "เซลล์ 2", role: "sales", isActive: true };

const leadA: Lead = { ...baseLead, id: "la", salesOwnerId: "sales_01", grade: "A", temperature: "HOT", totalScore: 90 };
const leadB: Lead = { ...baseLead, id: "lb", salesOwnerId: "sales_01", grade: "C", temperature: "COOL", totalScore: 50 };
const leadC: Lead = { ...baseLead, id: "lc", salesOwnerId: "sales_02", grade: "B", temperature: "WARM", totalScore: 70 };

// --- filterLeadsBySalesOwner ---
describe("filterLeadsBySalesOwner", () => {
  it("คืนเฉพาะ Lead ของ sales_01", () => {
    const result = filterLeadsBySalesOwner([leadA, leadB, leadC], "sales_01");
    expect(result).toHaveLength(2);
    expect(result.every((l) => l.salesOwnerId === "sales_01")).toBe(true);
  });

  it("คืน [] ถ้าไม่มี Lead ของ sales_03", () => {
    const result = filterLeadsBySalesOwner([leadA, leadB, leadC], "sales_03");
    expect(result).toHaveLength(0);
  });
});

// --- getVisibleLeadsForUser ---
describe("getVisibleLeadsForUser", () => {
  it("Owner เห็น Lead ทั้งหมด", () => {
    const result = getVisibleLeadsForUser([leadA, leadB, leadC], owner);
    expect(result).toHaveLength(3);
  });

  it("Sales เห็นเฉพาะ Lead ของตัวเอง", () => {
    const result = getVisibleLeadsForUser([leadA, leadB, leadC], sales01);
    expect(result).toHaveLength(2);
    expect(result.every((l) => l.salesOwnerId === "sales_01")).toBe(true);
  });

  it("Sales ที่ไม่มี Lead เห็น 0 Lead", () => {
    const result = getVisibleLeadsForUser([leadA, leadB, leadC], sales02);
    expect(result).toHaveLength(1);
  });
});

// --- calculateTeamMetrics ---
describe("calculateTeamMetrics", () => {
  it("คำนวณ totalLeads ถูกต้อง", () => {
    const m = calculateTeamMetrics([leadA, leadB, leadC], []);
    expect(m.totalLeads).toBe(3);
  });

  it("คำนวณ gradeA, hotLeads ถูกต้อง", () => {
    const m = calculateTeamMetrics([leadA, leadB, leadC], []);
    expect(m.gradeA).toBe(1);
    expect(m.hotLeads).toBe(1);
    expect(m.warmLeads).toBe(1);
    expect(m.coolLeads).toBe(1);
  });

  it("คำนวณ averageScore ถูกต้อง", () => {
    const m = calculateTeamMetrics([leadA, leadB, leadC], []);
    expect(m.averageScore).toBe(Math.round((90 + 50 + 70) / 3));
  });

  it("cToA นับจาก snapshots ถูกต้อง", () => {
    const s1: LeadScoreSnapshot = {
      id: "s1", leadId: "lb", previousTotalScore: 50, newTotalScore: 50,
      previousGrade: undefined, newGrade: "C", previousTemperature: undefined,
      newTemperature: "COOL", previousSegment: undefined, newSegment: "Low Priority",
      changedReason: "สร้าง Lead ใหม่", changedFields: [], createdAt: "2026-01-01T00:00:00Z",
    };
    const s2: LeadScoreSnapshot = {
      id: "s2", leadId: "lb", previousTotalScore: 50, newTotalScore: 85,
      previousGrade: "C", newGrade: "A", previousTemperature: "COOL",
      newTemperature: "HOT", previousSegment: "Low Priority", newSegment: "Ideal Customer",
      changedReason: "update", changedFields: ["grade"], createdAt: "2026-02-01T00:00:00Z",
    };
    const m = calculateTeamMetrics([leadA, leadB, leadC], [s1, s2]);
    expect(m.cToA).toBe(1);
  });
});

// --- calculateSalespersonSummary ---
describe("calculateSalespersonSummary", () => {
  it("คำนวณ totalLeads แยกตามเซลล์ถูกต้อง", () => {
    const result = calculateSalespersonSummary([leadA, leadB, leadC], [], [sales01, sales02]);
    const s1 = result.find((r) => r.salesOwnerId === "sales_01")!;
    const s2 = result.find((r) => r.salesOwnerId === "sales_02")!;
    expect(s1.totalLeads).toBe(2);
    expect(s2.totalLeads).toBe(1);
  });

  it("คำนวณ gradeA, hotLeads แยกตามเซลล์ถูกต้อง", () => {
    const result = calculateSalespersonSummary([leadA, leadB, leadC], [], [sales01, sales02]);
    const s1 = result.find((r) => r.salesOwnerId === "sales_01")!;
    expect(s1.gradeA).toBe(1);
    expect(s1.hotLeads).toBe(1);
  });
});

// --- calculateLeadDistributionBySalesperson ---
describe("calculateLeadDistributionBySalesperson", () => {
  it("คำนวณ distribution A/B/C/D ถูกต้อง", () => {
    const result = calculateLeadDistributionBySalesperson([leadA, leadB, leadC], [sales01, sales02]);
    const s1 = result.find((r) => r.salesOwnerId === "sales_01")!;
    expect(s1.gradeA).toBe(1);
    expect(s1.gradeC).toBe(1);
    expect(s1.total).toBe(2);
    const s2 = result.find((r) => r.salesOwnerId === "sales_02")!;
    expect(s2.gradeB).toBe(1);
    expect(s2.total).toBe(1);
  });
});
```

- [ ] **Step 2: รัน tests เพื่อให้แน่ใจว่า pass ทั้งหมด**

```bash
cd /Users/mark/Desktop/HAPPYSCORE && npm test -- --reporter=verbose 2>&1 | tail -40
```

Expected: ทุก test ใน teamMetrics.test.ts pass

- [ ] **Step 3: Commit**

```bash
git add src/tests/teamMetrics.test.ts
git commit -m "test: add unit tests for teamMetrics and visibilityFilter"
```

---

## Task 7: Update Mock Data (10+ Leads, 4 salesOwnerId)

**Files:**
- Modify: `src/data/mockLeads.ts`

- [ ] **Step 1: แก้ `src/data/mockLeads.ts`** — เปลี่ยน inputs array ทั้งหมดเป็น:

```typescript
import type { LeadInput } from "@/types/lead";
import { buildScoredLead } from "@/lib/leadFactory";

const inputs: (LeadInput & { _id: string; _salesOwnerId: string })[] = [
  {
    _id: "mock-1", _salesOwnerId: "sales_01",
    customerName: "คุณวิภา", phoneNumber: "081-111-2222", lineId: "wipa.home",
    province: "กรุงเทพ", district: "ลาดพร้าว", projectName: "บ้านเดี่ยวลาดพร้าว",
    leadSource: "Line", salesOwner: "เซลล์ 1",
    customerNote: "ส่งรูปพร้อมขนาด 4.5 x 3 เมตร รับราคาได้ ต้องการนัดวัดพื้นที่",
    installationLocationType: "bangkok_metropolitan", projectValueLevel: "luxury_over_6m",
    sitePhotoStatus: "detailed_with_measurement", urgencyStatus: "within_1_month",
    quotationStatus: "quoted_and_price_accepted", communicationStatus: "highly_responsive",
    siteSurveyStatus: "scheduled_easy_site"
  },
  {
    _id: "mock-2", _salesOwnerId: "sales_01",
    customerName: "คุณณัฐพล", phoneNumber: "081-457-9214", lineId: "nara1479",
    province: "ปทุมธานี", district: "ลำลูกกา", projectName: "เดอะเบส ลำลูกกา คลอง 6",
    leadSource: "Facebook", salesOwner: "เซลล์ 1",
    customerNote: "ไม่แน่ใจเรื่องขนาด จอดรถได้ 2 คัน ให้เสนอราคาในไลน์",
    installationLocationType: "bangkok_metropolitan", projectValueLevel: "mid_high_4m_to_6m",
    sitePhotoStatus: "photo_without_measurement", urgencyStatus: "within_3_months",
    quotationStatus: "quoted_but_hesitating", communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    _id: "mock-3", _salesOwnerId: "sales_01",
    customerName: "คุณผึ้ง", phoneNumber: "088-222-3333",
    province: "นนทบุรี", district: "เมืองนนทบุรี",
    leadSource: "Call", salesOwner: "เซลล์ 1",
    customerNote: "ทีมช่างวัดหน้างานแล้ว สนใจรุ่น Grand ต้องการสรุปใบเสนอราคา",
    installationLocationType: "bangkok_metropolitan", projectValueLevel: "luxury_over_6m",
    sitePhotoStatus: "detailed_with_measurement", urgencyStatus: "within_1_month",
    quotationStatus: "quoted_but_hesitating", communicationStatus: "highly_responsive",
    siteSurveyStatus: "scheduled_easy_site"
  },
  {
    _id: "mock-4", _salesOwnerId: "sales_02",
    customerName: "คุณชนินทร์", phoneNumber: "085-963-3699",
    province: "กรุงเทพ", district: "ดินแดง",
    leadSource: "Facebook", salesOwner: "เซลล์ 2",
    customerNote: "ต้องการติดหน้าออฟฟิศขนาดประมาณ 2.5 x 2 ขอราคารุ่น Luxury และ Classic ไฟฟ้า",
    installationLocationType: "bangkok_metropolitan", projectValueLevel: "mid_high_4m_to_6m",
    sitePhotoStatus: "photo_without_measurement", urgencyStatus: "within_3_months",
    quotationStatus: "quoted_but_hesitating", communicationStatus: "highly_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    _id: "mock-5", _salesOwnerId: "sales_02",
    customerName: "คุณกัสจัง", phoneNumber: "091-232-8381",
    province: "ฉะเชิงเทรา",
    leadSource: "Facebook", salesOwner: "เซลล์ 2",
    customerNote: "ขอราคาขนาด 4 x 2 เปรียบเทียบกับกันสาดถาวร แจ้งราคาสูงเกินงบ",
    installationLocationType: "near_bangkok_under_200km", projectValueLevel: "unknown",
    sitePhotoStatus: "photo_without_measurement", urgencyStatus: "just_researching",
    quotationStatus: "quoted_but_price_rejected", communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    _id: "mock-6", _salesOwnerId: "sales_02",
    customerName: "คุณเอก", phoneNumber: "086-461-8345",
    province: "นนทบุรี", projectName: "บ้านใหม่",
    leadSource: "Line", salesOwner: "เซลล์ 2",
    customerNote: "บ้านยังไม่เสร็จ ส่งรายละเอียดให้แฟนไปแล้ว ยังดูนิ่งอยู่",
    installationLocationType: "bangkok_metropolitan", projectValueLevel: "mid_high_4m_to_6m",
    sitePhotoStatus: "photo_without_measurement", urgencyStatus: "just_researching",
    quotationStatus: "not_quoted", communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    _id: "mock-7", _salesOwnerId: "sales_03",
    customerName: "คุณสระบุรี", phoneNumber: "096-010-7498",
    province: "สระบุรี",
    leadSource: "Line", salesOwner: "เซลล์ 3",
    customerNote: "ติดราคา แฟนยังไม่ให้ทำ",
    installationLocationType: "near_bangkok_under_200km", projectValueLevel: "below_4m",
    sitePhotoStatus: "not_sent", urgencyStatus: "just_researching",
    quotationStatus: "quoted_but_price_rejected", communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    _id: "mock-8", _salesOwnerId: "sales_03",
    customerName: "คุณระยอง", phoneNumber: "080-392-8218",
    province: "ระยอง",
    leadSource: "Facebook", salesOwner: "เซลล์ 3",
    customerNote: "ต้องการติดหน้าบ้าน 3 x 2.5 ขอให้ทีมช่างเข้าตรวจพื้นที่ก่อน",
    installationLocationType: "near_bangkok_under_200km", projectValueLevel: "unknown",
    sitePhotoStatus: "photo_without_measurement", urgencyStatus: "within_3_months",
    quotationStatus: "not_quoted", communicationStatus: "partially_responsive",
    siteSurveyStatus: "scheduled_difficult_site"
  },
  {
    _id: "mock-9", _salesOwnerId: "sales_04",
    customerName: "คุณชัยภูมิ", phoneNumber: "095-619-2542",
    province: "ชัยภูมิ",
    leadSource: "Facebook", salesOwner: "เซลล์ 4",
    customerNote: "ต้องการติดพื้นที่ด้านข้างบ้านชั้นเดียว ยังไม่แน่ใจขนาด",
    installationLocationType: "far_over_300km", projectValueLevel: "unknown",
    sitePhotoStatus: "not_sent", urgencyStatus: "unknown",
    quotationStatus: "not_quoted", communicationStatus: "partially_responsive",
    siteSurveyStatus: "not_scheduled"
  },
  {
    _id: "mock-10", _salesOwnerId: "sales_04",
    customerName: "คุณไม่รับสาย", phoneNumber: "095-494-4244",
    province: "ระยอง",
    leadSource: "Line", salesOwner: "เซลล์ 4",
    customerNote: "โทรแล้วไม่รับสาย แอดไลน์แล้วรอตอบกลับ",
    installationLocationType: "near_bangkok_under_200km", projectValueLevel: "unknown",
    sitePhotoStatus: "not_sent", urgencyStatus: "unknown",
    quotationStatus: "not_quoted", communicationStatus: "unresponsive",
    siteSurveyStatus: "not_scheduled"
  },
];

export const mockLeads = inputs.map((input, index) => {
  const { _id, _salesOwnerId, ...leadInput } = input;
  const lead = buildScoredLead(leadInput, {
    id: _id,
    createdAt: new Date(Date.UTC(2026, 0, index + 1, 3, 0, 0)).toISOString()
  });
  return {
    ...lead,
    salesOwnerId: _salesOwnerId,
    updatedAt: new Date(Date.UTC(2026, 0, index + 10, 3, 0, 0)).toISOString()
  };
});
```

- [ ] **Step 2: Commit**

```bash
git add src/data/mockLeads.ts
git commit -m "feat: update mock data with salesOwnerId for 4 salespeople"
```

---

## Task 8: CurrentUserSelector Component

**Files:**
- Create: `src/components/CurrentUserSelector.tsx`

- [ ] **Step 1: สร้าง `src/components/CurrentUserSelector.tsx`**

```typescript
"use client";

import { useEffect, useState } from "react";
import { SALESPEOPLE, getCurrentUser, setCurrentUser } from "@/lib/users";
import type { Salesperson } from "@/types/salesperson";

interface Props {
  onChange: (user: Salesperson) => void;
}

export function CurrentUserSelector({ onChange }: Props) {
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    const current = getCurrentUser();
    setSelected(current.id);
  }, []);

  function handleChange(id: string) {
    setCurrentUser(id);
    setSelected(id);
    const user = SALESPEOPLE.find((u) => u.id === id);
    if (user) onChange(user);
  }

  return (
    <div className="current-user-selector">
      <label htmlFor="current-user">มุมมองของ:</label>
      <select
        id="current-user"
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
      >
        {SALESPEOPLE.map((u) => (
          <option key={u.id} value={u.id}>
            {u.role === "owner" ? `👑 ${u.name}` : u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 2: เพิ่ม CSS สำหรับ CurrentUserSelector ใน `src/app/globals.css`**

เปิดไฟล์ `src/app/globals.css` และเพิ่ม ต่อท้ายไฟล์:

```css
.current-user-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.current-user-selector label {
  color: var(--muted, #666);
  white-space: nowrap;
}

.current-user-selector select {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border, #ddd);
  background: var(--bg, #fff);
  font-size: 0.9rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CurrentUserSelector.tsx src/app/globals.css
git commit -m "feat: add CurrentUserSelector component"
```

---

## Task 9: Update Main Dashboard Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: แก้ `src/app/page.tsx`** ทดแทนทั้งหมดด้วย:

```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardKpiCards } from "@/components/DashboardKpiCards";
import { LeadFilters, defaultFilter } from "@/components/LeadFilters";
import { LeadQuickView } from "@/components/LeadQuickView";
import { LeadTable } from "@/components/LeadTable";
import { PriorityCallList } from "@/components/PriorityCallList";
import { CurrentUserSelector } from "@/components/CurrentUserSelector";
import { exportLeadsToCsv } from "@/lib/exportCsv";
import { deleteLead, loadLeads } from "@/lib/storage";
import { getCurrentUser } from "@/lib/users";
import { getVisibleLeadsForUser } from "@/lib/visibilityFilter";
import type { Lead } from "@/types/lead";
import type { FilterState } from "@/components/LeadFilters";
import type { Salesperson } from "@/types/salesperson";

export default function DashboardPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [currentUser, setCurrentUser] = useState<Salesperson>(getCurrentUser());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [quickViewLead, setQuickViewLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadLeads()
      .then(setAllLeads)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const visibleLeads = useMemo(
    () => getVisibleLeadsForUser(allLeads, currentUser),
    [allLeads, currentUser]
  );

  const filteredLeads = useMemo(() => {
    return visibleLeads.filter((lead) => {
      if (filter.grade !== "all" && lead.grade !== filter.grade) return false;
      if (filter.temperature !== "all" && lead.temperature !== filter.temperature) return false;
      if (filter.segment !== "all" && lead.segment !== filter.segment) return false;
      if (filter.pipeline !== "all" && lead.pipelineStage !== filter.pipeline) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const haystack = [lead.customerName, lead.phoneNumber, lead.province, lead.projectName, lead.lineId]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [visibleLeads, filter]);

  async function handleDelete(id: string) {
    const lead = allLeads.find((item) => item.id === id);
    if (!lead) return;
    if (!window.confirm(`ลบ Lead "${lead.customerName}" ใช่ไหม?`)) return;
    try {
      setAllLeads(await deleteLead(id));
    } catch (e) {
      alert("ลบไม่สำเร็จ: " + (e instanceof Error ? e.message : ""));
    }
  }

  const isOwnerView = currentUser.role === "owner";

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>HAPPY v0.1 Lead Scoring</h1>
          <p>ระบบให้คะแนน แบ่งเกรด และจัดลำดับความสำคัญลูกค้ากันสาดไฟฟ้า</p>
        </div>
        <div className="actions">
          <CurrentUserSelector onChange={setCurrentUser} />
          <button
            className="button secondary"
            type="button"
            onClick={() => exportLeadsToCsv(filteredLeads)}
            disabled={filteredLeads.length === 0}
          >
            Export CSV ({filteredLeads.length})
          </button>
          {isOwnerView && (
            <Link className="button secondary" href="/team">👥 Team</Link>
          )}
          <Link className="button secondary" href="/performance">📊 Performance</Link>
          <Link className="button" href="/leads/new">+ เพิ่ม Lead ใหม่</Link>
        </div>
      </div>

      {!loaded ? (
        <div className="empty">กำลังโหลดข้อมูลจาก Supabase...</div>
      ) : error ? (
        <div className="error-box">โหลดข้อมูลไม่สำเร็จ: {error}</div>
      ) : (
        <>
          <DashboardKpiCards leads={visibleLeads} />
          <section className="section">
            <PriorityCallList leads={visibleLeads} onQuickView={setQuickViewLead} />
          </section>
          <section className="section">
            <div className="section-header">
              <h2>Lead ทั้งหมด</h2>
              <span className="muted">
                {visibleLeads.length} รายการ
                {isOwnerView ? " · ทีมทั้งหมด" : ` · ${currentUser.name}`}
              </span>
            </div>
            <LeadFilters value={filter} onChange={setFilter} total={visibleLeads.length} filtered={filteredLeads.length} />
            <LeadTable
              leads={filteredLeads}
              onDelete={handleDelete}
              onQuickView={setQuickViewLead}
              showSalesOwner={isOwnerView}
            />
          </section>
        </>
      )}

      {quickViewLead && (
        <LeadQuickView lead={quickViewLead} onClose={() => setQuickViewLead(null)} />
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: update dashboard to filter leads by current user"
```

---

## Task 10: Update LeadTable — เพิ่ม column ผู้รับผิดชอบ

**Files:**
- Modify: `src/components/LeadTable.tsx`

- [ ] **Step 1: แก้ props interface ของ LeadTable** — เพิ่ม `showSalesOwner?: boolean`

ใน function signature:
```typescript
export function LeadTable({
  leads,
  onDelete,
  onQuickView,
  showSalesOwner = false,
}: {
  leads: Lead[];
  onDelete: (id: string) => void;
  onQuickView?: (lead: Lead) => void;
  showSalesOwner?: boolean;
})
```

- [ ] **Step 2: เพิ่ม `<th>ผู้รับผิดชอบ</th>` ใน thead** — ต่อจาก `<th>ชื่อลูกค้า</th>` เพิ่ม (conditional):

```tsx
{showSalesOwner && <th>ผู้รับผิดชอบ</th>}
```

- [ ] **Step 3: เพิ่ม `<td>` ใน tbody** — ใน row ของแต่ละ lead ต่อจาก `<td><strong>{lead.customerName}</strong>...` เพิ่ม:

```tsx
{showSalesOwner && <td>{lead.salesOwnerName ?? lead.salesOwner ?? "—"}</td>}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/LeadTable.tsx
git commit -m "feat: add salesOwner column to LeadTable (owner view only)"
```

---

## Task 11: Update LeadForm — auto-assign salesOwnerId

**Files:**
- Modify: `src/components/LeadForm.tsx`
- Modify: `src/app/leads/new/page.tsx`
- Modify: `src/app/leads/[id]/page.tsx`

- [ ] **Step 1: อ่าน `src/app/leads/[id]/page.tsx`** เพื่อดูโครงสร้างก่อนแก้

```bash
cat /Users/mark/Desktop/HAPPYSCORE/src/app/leads/\[id\]/page.tsx
```

- [ ] **Step 2: แก้ `src/components/LeadForm.tsx`** — เพิ่ม prop `currentUser` และ field "ผู้รับผิดชอบ"

เพิ่ม import ที่ด้านบน:
```typescript
import { SALESPEOPLE } from "@/lib/users";
import type { Salesperson } from "@/types/salesperson";
```

เปลี่ยน props interface:
```typescript
export function LeadForm({
  initialValue = defaultLeadInput,
  existing,
  submitLabel,
  onSubmit,
  currentUser,
}: {
  initialValue?: LeadInput;
  existing?: Pick<Lead, "id" | "createdAt"> & { pipelineStage?: Lead["pipelineStage"] };
  submitLabel: string;
  onSubmit: (lead: Lead) => void;
  currentUser?: Salesperson;
})
```

เพิ่มใน field "เซลล์ผู้ดูแล" (แก้จาก input เดิม):

**ถ้า currentUser เป็น sales**: แสดง disabled input ชื่อตัวเอง
**ถ้า currentUser เป็น owner หรือไม่ระบุ**: แสดง dropdown เลือกเซลล์

```tsx
<div className="field">
  <label htmlFor="salesOwner">เซลล์ผู้ดูแล</label>
  {currentUser?.role === "sales" ? (
    <input id="salesOwner" value={currentUser.name} disabled />
  ) : (
    <select
      id="salesOwner"
      value={value.salesOwnerId ?? ""}
      onChange={(e) => {
        const sp = SALESPEOPLE.find((u) => u.id === e.target.value);
        if (sp) {
          updateField("salesOwnerId", sp.id);
          updateField("salesOwner", sp.name);
        }
      }}
    >
      <option value="">— เลือกเซลล์ —</option>
      {SALESPEOPLE.filter((u) => u.role === "sales").map((u) => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>
  )}
</div>
```

- [ ] **Step 3: แก้ handleSubmit ใน LeadForm** — auto-set salesOwnerId ถ้า currentUser เป็น sales

ใน `handleSubmit` ก่อน `onSubmit(buildScoredLead(...))` เพิ่ม:
```typescript
let submitValue = value;
if (currentUser?.role === "sales") {
  submitValue = {
    ...value,
    salesOwnerId: currentUser.id,
    salesOwner: currentUser.name,
  };
}
onSubmit(buildScoredLead(submitValue, existing));
```

และเอา `onSubmit(buildScoredLead(value, existing));` เดิมออก

- [ ] **Step 4: แก้ `src/app/leads/new/page.tsx`** — ส่ง currentUser ไปให้ LeadForm

เพิ่ม import:
```typescript
import { getCurrentUser } from "@/lib/users";
```

ใน component เพิ่ม state:
```typescript
const [currentUser] = useState(() => getCurrentUser());
```

แก้ JSX ส่วน LeadForm:
```tsx
<LeadForm
  submitLabel={saving ? "กำลังบันทึก..." : "Save Lead"}
  onSubmit={handleSubmit}
  currentUser={currentUser}
/>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/LeadForm.tsx src/app/leads/new/page.tsx
git commit -m "feat: auto-assign salesOwnerId in LeadForm based on currentUser"
```

---

## Task 12: Team Dashboard Page + Components

**Files:**
- Create: `src/components/TeamKpiCards.tsx`
- Create: `src/components/SalespersonSummaryTable.tsx`
- Create: `src/components/SalespersonDistributionTable.tsx`
- Create: `src/app/team/page.tsx`

- [ ] **Step 1: สร้าง `src/components/TeamKpiCards.tsx`**

```typescript
import type { TeamMetrics } from "@/lib/teamMetrics";

export function TeamKpiCards({ m }: { m: TeamMetrics }) {
  const items = [
    ["Lead ทั้งหมด", m.totalLeads],
    ["Grade A", m.gradeA],
    ["HOT Lead", m.hotLeads],
    ["WARM Lead", m.warmLeads],
    ["ต้องโทรวันนี้", m.totalPriorityLeads],
    ["C → A รวม", m.cToA],
    ["C → A %", `${m.cToARate}%`],
    ["Avg Score", m.averageScore],
  ] as const;

  return (
    <div className="grid kpi-grid">
      {items.map(([label, value]) => (
        <div className="card" key={label}>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: สร้าง `src/components/SalespersonSummaryTable.tsx`**

```typescript
import type { SalespersonSummary } from "@/lib/teamMetrics";

export function SalespersonSummaryTable({ data }: { data: SalespersonSummary[] }) {
  if (data.length === 0) return <div className="empty">ไม่มีข้อมูลพนักงานขาย</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>เซลล์</th>
            <th>Lead</th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
            <th>D</th>
            <th>HOT</th>
            <th>WARM</th>
            <th>Avg Score</th>
            <th>C→A</th>
            <th>C→B</th>
            <th>B→A</th>
            <th>Upgrade%</th>
            <th>Downgrade%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.salesOwnerId}>
              <td><strong>{row.salesOwnerName}</strong></td>
              <td>{row.totalLeads}</td>
              <td>{row.gradeA}</td>
              <td>{row.gradeB}</td>
              <td>{row.gradeC}</td>
              <td>{row.gradeD}</td>
              <td>{row.hotLeads}</td>
              <td>{row.warmLeads}</td>
              <td>{row.averageScore}</td>
              <td>{row.cToA}</td>
              <td>{row.cToB}</td>
              <td>{row.bToA}</td>
              <td>{row.upgradeRate}%</td>
              <td>{row.downgradeRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: สร้าง `src/components/SalespersonDistributionTable.tsx`**

```typescript
import type { SalespersonLeadDistribution } from "@/lib/teamMetrics";

export function SalespersonDistributionTable({ data }: { data: SalespersonLeadDistribution[] }) {
  if (data.length === 0) return <div className="empty">ไม่มีข้อมูล</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>เซลล์</th>
            <th>Grade A</th>
            <th>Grade B</th>
            <th>Grade C</th>
            <th>Grade D</th>
            <th>รวม</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.salesOwnerId}>
              <td><strong>{row.salesOwnerName}</strong></td>
              <td>{row.gradeA}</td>
              <td>{row.gradeB}</td>
              <td>{row.gradeC}</td>
              <td>{row.gradeD}</td>
              <td><strong>{row.total}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: สร้าง `src/app/team/page.tsx`**

```typescript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeamKpiCards } from "@/components/TeamKpiCards";
import { SalespersonSummaryTable } from "@/components/SalespersonSummaryTable";
import { SalespersonDistributionTable } from "@/components/SalespersonDistributionTable";
import { loadLeads } from "@/lib/storage";
import { loadSnapshots } from "@/lib/snapshotStorage";
import { SALESPEOPLE } from "@/lib/users";
import {
  calculateTeamMetrics,
  calculateSalespersonSummary,
  calculateLeadDistributionBySalesperson,
} from "@/lib/teamMetrics";
import type { Lead } from "@/types/lead";
import type { LeadScoreSnapshot } from "@/types/performance";
import type { TeamMetrics, SalespersonSummary, SalespersonLeadDistribution } from "@/lib/teamMetrics";

export default function TeamPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [snapshots, setSnapshots] = useState<LeadScoreSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([loadLeads(), loadSnapshots()])
      .then(([l, s]) => { setLeads(l); setSnapshots(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const emptyMetrics: TeamMetrics = {
    totalLeads: 0, gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0,
    hotLeads: 0, warmLeads: 0, coolLeads: 0, coldLeads: 0,
    averageScore: 0, totalPriorityLeads: 0, cToA: 0, cToARate: 0,
    upgradeCount: 0, downgradeCount: 0,
  };

  const metrics: TeamMetrics = loaded
    ? calculateTeamMetrics(leads, snapshots)
    : emptyMetrics;

  const summaries: SalespersonSummary[] = loaded
    ? calculateSalespersonSummary(leads, snapshots, SALESPEOPLE)
    : [];

  const distribution: SalespersonLeadDistribution[] = loaded
    ? calculateLeadDistributionBySalesperson(leads, SALESPEOPLE)
    : [];

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>Team Dashboard</h1>
          <p>ภาพรวมทีมขาย — Lead และ Performance แยกตามพนักงานขาย</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/performance">📊 Performance</Link>
          <Link className="button secondary" href="/">กลับ Dashboard</Link>
        </div>
      </div>

      {!loaded ? (
        <div className="empty">กำลังโหลดข้อมูล...</div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : (
        <div className="grid">
          <section className="section">
            <div className="section-header">
              <h2>KPI รวมทีม</h2>
              <span className="muted">{leads.length} leads · {SALESPEOPLE.filter((u) => u.role === "sales").length} เซลล์</span>
            </div>
            <TeamKpiCards m={metrics} />
          </section>

          <section className="section">
            <div className="section-header">
              <h2>Performance แยกตามเซลล์</h2>
            </div>
            <SalespersonSummaryTable data={summaries} />
          </section>

          <section className="section">
            <div className="section-header">
              <h2>Lead Distribution (A/B/C/D) แยกตามเซลล์</h2>
            </div>
            <SalespersonDistributionTable data={distribution} />
          </section>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/TeamKpiCards.tsx src/components/SalespersonSummaryTable.tsx \
        src/components/SalespersonDistributionTable.tsx src/app/team/page.tsx
git commit -m "feat: add /team page and team dashboard components"
```

---

## Task 13: Update /performance Page — Filter ตาม currentUser

**Files:**
- Modify: `src/app/performance/page.tsx`

- [ ] **Step 1: แก้ `src/app/performance/page.tsx`** — เพิ่ม currentUser state + filter leads

เพิ่ม imports:
```typescript
import { getCurrentUser } from "@/lib/users";
import { getVisibleLeadsForUser } from "@/lib/visibilityFilter";
import { CurrentUserSelector } from "@/components/CurrentUserSelector";
import type { Salesperson } from "@/types/salesperson";
```

เพิ่ม state ใน component:
```typescript
const [currentUser, setCurrentUser] = useState<Salesperson>(getCurrentUser());
```

เพิ่ม derived value หลัง load:
```typescript
const visibleLeads = loaded ? getVisibleLeadsForUser(leads, currentUser) : [];
```

แก้ทุก reference จาก `leads` เป็น `visibleLeads` ใน calculatePerformanceMetrics, calculateSalesOwnerPerformance, buildLeadProgressEntries

เพิ่ม `<CurrentUserSelector onChange={setCurrentUser} />` ใน topbar actions

- [ ] **Step 2: Commit**

```bash
git add src/app/performance/page.tsx
git commit -m "feat: filter performance page by currentUser role"
```

---

## Task 14: Run All Tests + Verify

- [ ] **Step 1: รัน tests ทั้งหมด**

```bash
cd /Users/mark/Desktop/HAPPYSCORE && npm test 2>&1
```

Expected: ทุก test pass (เดิม 33 tests + tests ใหม่ใน teamMetrics.test.ts)

- [ ] **Step 2: รัน dev server**

```bash
cd /Users/mark/Desktop/HAPPYSCORE && npm run dev
```

- [ ] **Step 3: Manual test checklist**

```text
1. เปิด http://localhost:3000
2. เลือก CurrentUserSelector → "เซลล์ 1" — ตรวจว่า Dashboard แสดงเฉพาะ Lead ของ sales_01
3. เลือก → "เซลล์ 2" — ตรวจว่าไม่เห็น Lead ของ sales_01
4. เลือก → "เจ้าของ" — ตรวจว่าเห็น Lead ทั้งหมด + ปุ่ม Team ปรากฏ
5. คลิก "เพิ่ม Lead ใหม่" ขณะเป็น "เซลล์ 1" — ตรวจว่า field ผู้รับผิดชอบ locked เป็น "เซลล์ 1"
6. บันทึก Lead ใหม่ — ตรวจว่า Lead ปรากฏใน Dashboard ของ "เซลล์ 1"
7. เปลี่ยนเป็น "เจ้าของ" คลิก "เพิ่ม Lead ใหม่" — ตรวจว่าเห็น dropdown เลือกเซลล์
8. เปิด http://localhost:3000/team — ตรวจว่า KPI cards แสดงข้อมูลรวม
9. ตรวจ SalespersonSummaryTable มีแถวครบ 4 เซลล์
10. ตรวจ SalespersonDistributionTable แสดง A/B/C/D ครบ
11. ตรวจ LeadTable ใน Owner view มี column "ผู้รับผิดชอบ"
12. เปิด http://localhost:3000/performance ตรวจว่ามี CurrentUserSelector ด้วย
```

---

## Task 15: Update Documentation

**Files:**
- Update: `DEVELOPMENT_LOG.md` (สร้างถ้าไม่มี)
- Update: `NEXT_ACTION.md` (สร้างถ้าไม่มี)

- [ ] **Step 1: สร้าง/อัปเดต `DEVELOPMENT_LOG.md`**

เพิ่มหัวข้อใหม่:
```markdown
## 2026-06-09 — Sales Team Separation + Owner Dashboard

### สิ่งที่ทำ
- เพิ่ม Salesperson type + user registry (src/types/salesperson.ts, src/lib/users.ts)
- เพิ่ม salesOwnerId field ใน Lead type + storage mapping
- เพิ่ม visibilityFilter: getVisibleLeadsForUser, filterLeadsBySalesOwner
- เพิ่ม teamMetrics: calculateTeamMetrics, calculateSalespersonSummary, calculateLeadDistributionBySalesperson
- เพิ่ม CurrentUserSelector component (localStorage-based, no Auth)
- อัปเดต Dashboard หลัก (/): filter leads ตาม currentUser
- เพิ่มหน้า /team: Team KPI + SalespersonSummaryTable + SalespersonDistributionTable
- อัปเดต LeadForm: auto-assign salesOwnerId ถ้า currentUser เป็น sales
- อัปเดต LeadTable: เพิ่ม column ผู้รับผิดชอบ (owner view only)
- อัปเดต mock data: 10 leads กระจาย 4 เซลล์
- เพิ่ม unit tests: teamMetrics.test.ts

### Data Visibility Rule
- Salesperson เห็นเฉพาะ Lead ของตัวเอง (filter by salesOwnerId)
- Owner เห็น Lead ทั้งหมด
- MVP: UI-level separation เท่านั้น ไม่ใช่ security-level (ยังไม่มี Auth จริง)

### Supabase Migrations รัน
- ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage ...
- ALTER TABLE leads ADD COLUMN IF NOT EXISTS sales_owner_id TEXT
```

- [ ] **Step 2: สร้าง/อัปเดต `NEXT_ACTION.md`**

```markdown
## Next Actions

### ต่อยอดระยะต่อไป (ยังไม่ได้ทำ)
1. Auth จริง (Next-Auth หรือ Supabase Auth) — ตอนนี้ currentUser เป็นแค่ localStorage
2. Row-Level Security ใน Supabase — filter by sales_owner_id ฝั่ง DB
3. ชื่อจริงพนักงานขาย — แก้ใน src/lib/users.ts (ตอนนี้ใช้ "เซลล์ 1-4")
4. Top Priority Leads by Salesperson section ใน /team
5. Chart/Visualization ใน Team Dashboard
```

- [ ] **Step 3: Commit**

```bash
git add DEVELOPMENT_LOG.md NEXT_ACTION.md
git commit -m "docs: update development log and next actions for sales team separation"
```

---

## Self-Review — Spec Coverage Check

| Spec Section | Task ที่ครอบคลุม |
|---|---|
| Salesperson 4 คน + Owner | Task 2: users.ts registry |
| salesOwnerId ใน Lead | Task 3: types + storage |
| CurrentUserSelector | Task 8: component |
| Sales เห็นเฉพาะ Lead ตัวเอง | Task 4 + 9: filter + dashboard |
| Owner เห็นทุก Lead | Task 4 + 9: filter + dashboard |
| Add Lead auto-assign salesOwnerId | Task 11: LeadForm |
| LeadTable column ผู้รับผิดชอบ | Task 10: LeadTable |
| /team page + KPI | Task 12 |
| SalespersonSummaryTable | Task 12 |
| SalespersonDistributionTable | Task 12 |
| /performance filter ตาม currentUser | Task 13 |
| Unit tests: visibility + teamMetrics | Task 6 |
| Mock data 10 leads 4 salesOwner | Task 7 |
| Supabase migration | Task 1 |
| Documentation update | Task 15 |
| Verify + Manual test | Task 14 |

**Gaps ที่ตรวจพบ:**
- `src/app/leads/[id]/page.tsx` — ต้องอ่านก่อน Task 11 Step 1 เพราะอาจต้องส่ง currentUser ไปด้วย (edit form)
- mock data ใน Task 7 ใช้ `_id`, `_salesOwnerId` เป็น private fields บน object — ต้องแน่ใจว่า destructuring ทำงานถูกต้อง (TypeScript อาจ complain ว่า `_id` ไม่อยู่ใน LeadInput type) → แก้ไขโดยสร้าง type ใหม่เฉพาะ Task นี้ `(LeadInput & { _id: string; _salesOwnerId: string })` ซึ่งได้เขียนไว้แล้ว

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-09-sales-team-separation.md`**

Two execution options:

**1. Subagent-Driven (recommended)** — dispatch fresh subagent per task, review between tasks

**2. Inline Execution** — execute tasks in this session using executing-plans skill

Which approach?
