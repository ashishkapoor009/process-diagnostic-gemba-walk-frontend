import type { KpiSummary } from "@/lib/types";
import { Badge, Card, MetricTile } from "@/components/ui";

const STATUS_COLOR: Record<string, string> = {
  "Above Benchmark": "green",
  "Near Benchmark": "amber",
  "Below Benchmark": "red",
};

export function KpiBenchmarkSection({ kpi }: { kpi: KpiSummary }) {
  if (!kpi || !kpi.kpis?.length) {
    return <p className="text-sm text-muted">KPI benchmarking not yet available for this process.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricTile label="Benchmark Category" value={kpi.benchmark_category} />
        <MetricTile label="Process Maturity Score" value={`${kpi.maturity_score}/100`} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="text-left">
              <Th>KPI</Th>
              <Th>Current</Th>
              <Th>Golden Benchmark</Th>
              <Th>Projected (Post-Recommendations)</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {kpi.kpis.map((row) => (
              <tr key={row.kpi} className="border-t border-border align-top">
                <Td>
                  <div className="font-medium">{row.kpi}</div>
                  {row.note && <div className="mt-1 text-xs text-muted">{row.note}</div>}
                </Td>
                <Td>{row.current} {row.unit}</Td>
                <Td>{row.benchmark} {row.unit}</Td>
                <Td>{row.projected !== null ? `${row.projected} ${row.unit}` : "—"}</Td>
                <Td>
                  <Badge color={STATUS_COLOR[row.status] ?? "blue"}>{row.status}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="text-xs text-muted">{kpi.benchmark_source_note}</Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold text-muted">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
