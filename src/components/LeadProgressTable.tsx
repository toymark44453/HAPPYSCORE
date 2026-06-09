import type { LeadProgressEntry } from "@/types/performance";

const MOVEMENT_LABELS: Record<string, string> = {
  major_upgrade: "⬆⬆ Major Upgrade",
  upgrade: "⬆ Upgrade",
  stable: "— Stable",
  downgrade: "⬇ Downgrade",
  major_downgrade: "⬇⬇ Major Downgrade",
};

const STATUS_COLORS: Record<string, string> = {
  strongly_improved: "#067647",
  improved: "#16a34a",
  stable: "#667085",
  declined: "#b54708",
  strongly_declined: "#b42318",
};

export function LeadProgressTable({ entries }: { entries: LeadProgressEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="card">
        <h2>Lead Progress</h2>
        <p className="muted">ยังไม่มีการเปลี่ยนแปลงคะแนน — แก้ไข Lead ให้คะแนนเปลี่ยนก่อน</p>
      </div>
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric", month: "short", year: "2-digit",
    });
  }

  return (
    <div className="card">
      <h2>Lead Progress</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ชื่อลูกค้า</th>
              <th>เซลล์</th>
              <th style={{ textAlign: "right" }}>คะแนนเดิม</th>
              <th style={{ textAlign: "right" }}>คะแนนใหม่</th>
              <th>Grade เดิม</th>
              <th>Grade ใหม่</th>
              <th>Movement</th>
              <th style={{ textAlign: "right" }}>เปลี่ยนแปลง</th>
              <th>เหตุผล</th>
              <th>วันที่</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const isUp = e.movement === "upgrade" || e.movement === "major_upgrade";
              const isDown = e.movement === "downgrade" || e.movement === "major_downgrade";
              return (
                <tr key={`${e.leadId}_${e.updatedAt}`}>
                  <td>
                    <strong>{e.customerName}</strong>
                  </td>
                  <td className="muted">{e.salesOwner ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{e.firstScore}</td>
                  <td style={{ textAlign: "right" }}>
                    <strong style={{ color: STATUS_COLORS[e.progressStatus] }}>
                      {e.latestScore}
                    </strong>
                  </td>
                  <td>
                    <span className="badge">{e.firstGrade}</span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: isUp ? "#dcfce7" : isDown ? "#fee2e2" : "#f1f5f9",
                        color: isUp ? "#067647" : isDown ? "#b42318" : "#667085",
                      }}
                    >
                      {e.latestGrade}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{MOVEMENT_LABELS[e.movement]}</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: STATUS_COLORS[e.progressStatus],
                      fontWeight: 700,
                    }}
                  >
                    {e.scoreDiff > 0 ? `+${e.scoreDiff}` : e.scoreDiff}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{e.changedReason}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{formatDate(e.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
