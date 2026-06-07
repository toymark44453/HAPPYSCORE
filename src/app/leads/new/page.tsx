"use client";

import { useRouter } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import { upsertLead } from "@/lib/storage";
import type { Lead } from "@/types/lead";

export default function NewLeadPage() {
  const router = useRouter();

  function handleSubmit(lead: Lead) {
    upsertLead(lead);
    router.push(`/leads/${lead.id}`);
  }

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>เพิ่ม Lead ใหม่</h1>
          <p>เลือก Fact ของลูกค้า แล้วระบบจะคำนวณคะแนนอัตโนมัติ</p>
        </div>
      </div>
      <LeadForm submitLabel="Save Lead" onSubmit={handleSubmit} />
    </main>
  );
}
