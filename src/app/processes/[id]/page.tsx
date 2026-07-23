import { api } from "@/lib/api";
import { Card, MetricTile, SectionHeading } from "@/components/ui";
import { RecommendationsTable } from "@/components/RecommendationsTable";
import { ReportDownloads } from "@/components/ReportDownloads";
import { MermaidDiagram } from "@/components/MermaidDiagram";

export const dynamic = "force-dynamic";

export default async function ProcessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const processId = Number(id);

  let detail;
  try {
    detail = await api.getProcess(processId);
  } catch {
    return (
      <Card className="border-red-300 bg-red-50 text-red-900">
        Could not load process #{processId}. It may not exist yet, or the diagnostic hasn&apos;t finished.
      </Card>
    );
  }

  const s = detail.savings_summary;

  return (
    <div className="space-y-8">
      <SectionHeading title={`Report Package: ${detail.metadata.process_name}`} subtitle={`${detail.metadata.team_name} | ${detail.metadata.lob}`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <MetricTile label="Recommendations" value={String(s.total_recommendations)} />
        <MetricTile label="Est. FTE Savings" value={String(s.total_fte_savings)} />
        <MetricTile label="In-Year Savings" value={`$${s.in_year_savings.toLocaleString()}`} />
        <MetricTile label="12-Month Savings" value={`$${s.twelve_month_savings.toLocaleString()}`} />
        <MetricTile label="Efficiency Improvement" value={`${s.blended_efficiency_improvement_pct}%`} />
      </div>
      <p className="text-xs text-muted">
        In-Year Savings = monthly FTE cost (${s.annual_fte_cost.toLocaleString()}/yr &divide; 12) &times;{" "}
        {s.months_remaining_in_year} months remaining this year &times; {s.total_fte_savings} FTEs released.
        12-Month Savings = annual FTE cost &times; FTEs released (full run-rate).
      </p>

      <Card>
        <h3 className="mb-2 font-semibold">Executive Summary</h3>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {detail.executive_summary || "Not yet generated."}
        </div>
      </Card>

      <div>
        <SectionHeading title="Process Flow" subtitle="Current-state (swimlane) vs. future-state (post-improvement) flow." />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <MermaidDiagram chart={detail.flow_mermaid_current} title="📍 Current State" />
          </Card>
          <Card>
            <MermaidDiagram chart={detail.flow_mermaid_future} title="🚀 Future State" />
          </Card>
        </div>
      </div>

      <div>
        <SectionHeading title="Current-State Process Diagnostics" />
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left">
                <Th>Step</Th>
                <Th>Name</Th>
                <Th>Owner</Th>
                <Th>Value Class</Th>
                <Th>Cycle (m)</Th>
                <Th>Wastes</Th>
                <Th>Automation</Th>
                <Th>AI Readiness</Th>
              </tr>
            </thead>
            <tbody>
              {detail.diagnostics.map((d) => (
                <tr key={d.step_number} className="border-t border-border">
                  <Td>{d.step_number}</Td>
                  <Td>{d.step_name}</Td>
                  <Td>{d.owner}</Td>
                  <Td>{d.value_classification}</Td>
                  <Td>{d.cycle_time_minutes}</Td>
                  <Td>{d.lean_wastes.join(", ") || "None"}</Td>
                  <Td>{d.automation_score}</Td>
                  <Td>{d.ai_readiness_score}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionHeading
          title="All Recommendations"
          subtitle="Categorized People / Process / Technology (main category) with a specific sub-category."
        />
        <RecommendationsTable recommendations={detail.recommendations} />
      </div>

      <div>
        <SectionHeading title="Download Deliverables" />
        <ReportDownloads processId={processId} />
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold text-muted">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
