"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { upsertLead } from "@/lib/storage";
import { addSnapshot, buildFirstSnapshot } from "@/lib/snapshotStorage";
import { getCurrentUser } from "@/lib/users";
import type { Lead } from "@/types/lead";

export default function NewLeadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentUser] = useState(() => getCurrentUser());

  async function handleSubmit(lead: Lead) {
    setSaving(true);
    setError("");
    try {
      await upsertLead(lead);
      await addSnapshot(buildFirstSnapshot(lead));
      router.push(`/leads/${lead.id}`);
    } catch (e) {
      setError("บันทึกไม่สำเร็จ: " + (e instanceof Error ? e.message : ""));
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>เพิ่ม Lead ใหม่</h1>
          <p>เลือก Fact ของลูกค้า แล้วระบบจะคำนวณคะแนนอัตโนมัติ</p>
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
      <LeadForm
        submitLabel={saving ? "กำลังบันทึก..." : "Save Lead"}
        onSubmit={handleSubmit}
        currentUser={currentUser}
      />
    </main>
  );
}
