import { api } from "@/lib/api";
import { Card, MetricTile, SectionHeading } from "@/components/ui";
import { RecommendationsTable } from "@/components/RecommendationsTable";
import { RecommendationsByStepTable } from "@/components/RecommendationsByStepTable";
import { EvaluationResultsTables } from "@/components/EvaluationResultsTables";
import { KpiBenchmarkSection } from "@/components/KpiBenchmarkSection";
import { ReportDownloads } from "@/components/ReportDownloads";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { EditableDiagnosticsTable } from "@/components/EditableDiagnosticsTable";

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
        <MetricTile label="In-Year Savings" value={`$${s.in_year_savings.toLocaleString("en-US")}`} />
        <MetricTile label="12-Month Savings" value={`$${s.twelve_month_savings.toLocaleString("en-US")}`} />
        <MetricTile label="Efficiency Improvement" value={`${s.blended_efficiency_improvement_pct}%`} />
      </div>
      <p className="text-xs text-muted">
        In-Year Savings = monthly FTE cost (${s.annual_fte_cost.toLocaleString("en-US")}/yr &divide; 12) &times;{" "}
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
        <EditableDiagnosticsTable processId={processId} diagnostics={detail.diagnostics} />
      </div>

      <div>
        <SectionHeading
          title="All Recommendations"
          subtitle="Categorized People / Process / Technology (main category) with a specific sub-category."
        />
        <RecommendationsTable recommendations={detail.recommendations} />
      </div>

      <div>
        <SectionHeading
          title="Recommendations by Process Step"
          subtitle="Every recommendation mapped to the specific step it applies to, with the problem statement it resolves."
        />
        <RecommendationsByStepTable diagnostics={detail.diagnostics} recommendations={detail.recommendations} />
      </div>

      <div>
        <SectionHeading
          title="KPI Benchmarking"
          subtitle="Current-state KPIs vs. the golden benchmark dataset, and where recommendations should land you."
        />
        <KpiBenchmarkSection kpi={detail.kpi_summary} />
      </div>

      <div>
        <SectionHeading
          title="Evaluation Results"
          subtitle="RAGAS quality scores and deep evaluation (grounding + numeric sanity) findings, by review round."
        />
        <EvaluationResultsTables evaluationScores={detail.evaluation_scores} deepEvalFindings={detail.deep_eval_findings} />
      </div>

      <div>
        <SectionHeading title="Download Deliverables" />
        <ReportDownloads processId={processId} />
      </div>
    </div>
  );
}
