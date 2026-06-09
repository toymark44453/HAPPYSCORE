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
