import type { SalesOwnerPerformance } from "@/types/performance";

export function SalesOwnerPerformanceTable({ data }: { data: SalesOwnerPerformance[] }) {
  if (data.length === 0) {
    return (
      <div className="card">
        <h2>Performance ตามเซลล์</h2>
        <p className="muted">ยังไม่มีข้อมูล — เพิ่ม Lead และแก้ไขให้คะแนนเปลี่ยนก่อน</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Performance ตามเซลล์</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>เซลล์</th>
              <th style={{ textAlign: "right" }}>Lead ทั้งหมด</th>
              <th style={{ textAlign: "right" }}>ดีขึ้น</th>
              <th style={{ textAlign: "right" }}>Improve %</th>
              <th style={{ textAlign: "right" }}>ลดลง</th>
              <th style={{ textAlign: "right" }}>Downgrade %</th>
              <th style={{ textAlign: "right" }}>C→A</th>
              <th style={{ textAlign: "right" }}>C→B</th>
              <th style={{ textAlign: "right" }}>B→A</th>
              <th style={{ textAlign: "right" }}>คะแนนเฉลี่ย</th>
              <th style={{ textAlign: "right" }}>Grade A</th>
            </tr>
          </thead>
          <tbody>
            {data
              .sort((a, b) => b.improvedRate - a.improvedRate)
              .map((row) => (
                <tr key={row.salesOwner}>
                  <td>
                    <strong>{row.salesOwner}</strong>
                  </td>
                  <td style={{ textAlign: "right" }}>{row.totalLeadsOwned}</td>
                  <td style={{ textAlign: "right", color: "#067647" }}>{row.improvedLeads}</td>
                  <td style={{ textAlign: "right", color: "#067647" }}>{row.improvedRate}%</td>
                  <td style={{ textAlign: "right", color: "#b42318" }}>{row.declinedLeads}</td>
                  <td style={{ textAlign: "right", color: "#b42318" }}>{row.downgradeRate}%</td>
                  <td style={{ textAlign: "right" }}>{row.cToA}</td>
                  <td style={{ textAlign: "right" }}>{row.cToB}</td>
                  <td style={{ textAlign: "right" }}>{row.bToA}</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: row.averageScoreChange > 0 ? "#067647" : row.averageScoreChange < 0 ? "#b42318" : "#667085",
                    }}
                  >
                    {row.averageScoreChange > 0 ? `+${row.averageScoreChange}` : row.averageScoreChange}
                  </td>
                  <td style={{ textAlign: "right" }}>{row.gradeAConverted}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
