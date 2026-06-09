# HAPPY Lead Scoring — Next Actions

## ทำทันที (สำคัญ)

### 1. รัน Supabase SQL Migration
URL: https://supabase.com/dashboard/project/cnksgyyuykughllmmpgw/sql

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new' CHECK (pipeline_stage IN ('new','contacted','quoted','won','lost'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sales_owner_id TEXT;
```

### 2. เปลี่ยนชื่อเซลล์จริง
แก้ไขใน `src/lib/users.ts`:
```typescript
{ id: "sales_01", name: "แอน",  role: "sales", isActive: true },
{ id: "sales_02", name: "เมย์",  role: "sales", isActive: true },
// ...
```

### 3. Deploy บน Vercel
```bash
git add -A && git commit -m "feat: sales team separation + owner dashboard"
git push origin main
```

## ต่อยอดในอนาคต

- **Auth จริง**: Supabase Auth หรือ Next-Auth — เปลี่ยน localStorage currentUser เป็น session จริง
- **Row-Level Security**: Supabase RLS ให้ filter by `sales_owner_id` ฝั่ง DB
- **ชื่อพนักงานขาย**: Update `src/lib/users.ts` ตามชื่อจริง 4 คน
- **Top Priority Leads by Salesperson**: เพิ่ม section ใน /team แสดง HOT leads แยกตามเซลล์
- **Chart**: Visualization ใน Team Dashboard (Grade distribution bar chart)
- **Notification**: แจ้งเตือนเมื่อ HOT lead ไม่ได้ติดต่อ > X วัน
