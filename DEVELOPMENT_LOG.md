# HAPPY Lead Scoring — Development Log

## 2026-06-09 — Sales Team Separation + Owner Dashboard

### สิ่งที่ทำ
- เพิ่ม `src/types/salesperson.ts` — Salesperson type + UserRole
- เพิ่ม `src/lib/users.ts` — static registry 4 เซลล์ + เจ้าของ + getCurrentUser/setCurrentUser (localStorage)
- เพิ่ม `salesOwnerId`, `salesOwnerName` ใน `src/types/lead.ts` (ต่อยอดจาก salesOwner เดิม ไม่ลบ)
- เพิ่ม mapping `sales_owner_id` ใน `src/lib/storage.ts`
- สร้าง `src/lib/visibilityFilter.ts` — getVisibleLeadsForUser, filterLeadsBySalesOwner
- สร้าง `src/lib/teamMetrics.ts` — calculateTeamMetrics, calculateSalespersonSummary, calculateLeadDistributionBySalesperson
- สร้าง `src/components/CurrentUserSelector.tsx` — dropdown เลือก owner/sales, เก็บใน localStorage
- อัปเดต `src/app/page.tsx` — filter leads ตาม currentUser, ปุ่ม Team (เฉพาะ owner)
- อัปเดต `src/components/LeadTable.tsx` — เพิ่ม column ผู้รับผิดชอบ (showSalesOwner prop)
- อัปเดต `src/components/LeadForm.tsx` — auto-assign salesOwnerId ถ้า sales, dropdown เลือกเซลล์สำหรับ owner
- อัปเดต `src/app/leads/new/page.tsx` — ส่ง currentUser ไป LeadForm
- สร้าง `src/components/TeamKpiCards.tsx`
- สร้าง `src/components/SalespersonSummaryTable.tsx`
- สร้าง `src/components/SalespersonDistributionTable.tsx`
- สร้าง `src/app/team/page.tsx` — Team Dashboard (KPI + Performance + Distribution)
- อัปเดต `src/app/performance/page.tsx` — เพิ่ม CurrentUserSelector + filter ตาม currentUser
- อัปเดต `src/data/mockLeads.ts` — 10 leads กระจาย 4 เซลล์
- อัปเดต `src/tests/performance.test.ts` — เพิ่ม pipelineStage: "new" ใน baseLead
- สร้าง `src/tests/teamMetrics.test.ts` — 15 tests ครอบคลุม visibility + team metrics

### Data Visibility Rule
- Salesperson เห็นเฉพาะ Lead ที่ `salesOwnerId` ตรงกับตัวเอง
- Owner เห็น Lead ทั้งหมด
- MVP: UI-level separation — ยังไม่มี Auth/Security จริง (ไม่มี Row-Level Security ใน Supabase)

### Supabase Migrations (ต้องรันเอง)
URL: https://supabase.com/dashboard/project/cnksgyyuykughllmmpgw/sql
```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new' CHECK (pipeline_stage IN ('new','contacted','quoted','won','lost'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sales_owner_id TEXT;
```

### Test Results
- 48 tests ผ่านทั้งหมด (6 test files)
- TypeScript: 0 errors
