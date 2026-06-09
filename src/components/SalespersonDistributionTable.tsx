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
