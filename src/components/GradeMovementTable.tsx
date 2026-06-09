import type { LeadScoreSnapshot } from "@/types/performance";
import { calculateGradeMovement } from "@/lib/performance";
import type { LeadGrade } from "@/types/lead";

type Movement = { from: LeadGrade; to: LeadGrade; label: string };

const MOVEMENTS: Movement[] = [
  { from: "D", to: "C", label: "D → C" },
  { from: "D", to: "B", label: "D → B" },
  { from: "D", to: "A", label: "D → A" },
  { from: "C", to: "B", label: "C → B" },
  { from: "C", to: "A", label: "C → A ⭐" },
  { from: "B", to: "A", label: "B → A" },
  { from: "A", to: "B", label: "A → B" },
  { from: "B", to: "C", label: "B → C" },
  { from: "C", to: "D", label: "C → D" },
];

function countMovement(snapshots: LeadScoreSnapshot[], from: LeadGrade, to: LeadGrade): number {
  // For each lead, compare first vs latest grade
  const byLead = new Map<string, LeadScoreSnapshot[]>();
  for (const s of snapshots) {
    if (!byLead.has(s.leadId)) byLead.set(s.leadId, []);
    byLead.get(s.leadId)!.push(s);
  }
  let count = 0;
  for (const snaps of byLead.values()) {
    const sorted = [...snaps].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    if (sorted.length < 2) continue;
    const first = sorted[0].newGrade;
    const last = sorted[sorted.length - 1].newGrade;
    if (first === from && last === to) count++;
  }
  return count;
}

export function GradeMovementTable({ snapshots }: { snapshots: LeadScoreSnapshot[] }) {
  const total = snapshots.length;

  return (
    <div className="card">
      <h2>Grade Movement</h2>
      <table>
        <thead>
          <tr>
            <th>Movement</th>
            <th style={{ textAlign: "right" }}>จำนวน Lead</th>
            <th style={{ textAlign: "right" }}>%</th>
            <th>ประเภท</th>
          </tr>
        </thead>
        <tbody>
          {MOVEMENTS.map(({ from, to, label }) => {
            const count = countMovement(snapshots, from, to);
            const pct = total === 0 ? 0 : Math.round((count / total) * 1000) / 10;
            const movement = calculateGradeMovement(from, to);
            const isUp = movement === "upgrade" || movement === "major_upgrade";
            const isDown = movement === "downgrade" || movement === "major_downgrade";
            return (
              <tr key={label}>
                <td>
                  <strong style={{ color: isUp ? "#067647" : isDown ? "#b42318" : "#667085" }}>
                    {label}
                  </strong>
                </td>
                <td style={{ textAlign: "right" }}>{count}</td>
                <td style={{ textAlign: "right" }}>{pct}%</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: isUp ? "#dcfce7" : isDown ? "#fee2e2" : "#f1f5f9",
                      color: isUp ? "#067647" : isDown ? "#b42318" : "#667085",
                    }}
                  >
                    {movement === "major_upgrade"
                      ? "⬆⬆ Major Upgrade"
                      : movement === "upgrade"
                      ? "⬆ Upgrade"
                      : movement === "major_downgrade"
                      ? "⬇⬇ Major Downgrade"
                      : movement === "downgrade"
                      ? "⬇ Downgrade"
                      : "— Stable"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
