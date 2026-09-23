import Link from "next/link";
import { api, API_URL } from "@/lib/api";
import { Card, MetricTile, PrimaryButton, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let processes: Awaited<ReturnType<typeof api.listProcesses>> = [];
  let apiError: string | null = null;

  try {
    processes = await api.listProcesses();
  } catch {
    apiError = `Could not reach the backend API at ${API_URL}. Set NEXT_PUBLIC_API_URL and make sure the backend is running.`;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-brand-blue to-blue-500 p-8 text-white">
        <h1 className="text-2xl font-bold">Process Diagnostic / Gemba Walk Multi-Agent Solution</h1>
        <p className="mt-1 text-blue-100">
          Six specialist ReAct agents, RAG-grounded knowledge, and RAGAS-evaluated recommendations for
          Lean, Process Simplification, Standardization, Automation/RPA, and AI Agentic opportunities.
        </p>
      </div>

      {apiError && (
        <Card className="border-amber-300 bg-amber-50 text-amber-900">
          <strong>Backend unreachable.</strong> {apiError}
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricTile label="Processes Diagnosed" value={String(processes.length)} />
        <MetricTile
          label="Total FTE"
          value={processes.reduce((sum, p) => sum + p.current_fte, 0).toFixed(0)}
        />
        <MetricTile
          label="Total Volume/Period"
          value={processes.reduce((sum, p) => sum + p.current_volume, 0).toLocaleString("en-US")}
        />
        <MetricTile label="Avg. AHT (min)" value={
          processes.length
            ? (processes.reduce((sum, p) => sum + p.aht_minutes, 0) / processes.length).toFixed(1)
            : "-"
        } />
      </div>

      <div>
        <SectionHeading title="Recent Process Diagnostics" />
        {processes.length === 0 ? (
          <Card>
            <p className="text-muted">No processes analyzed yet. Start your first Gemba walk diagnostic.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {processes.slice(0, 10).map((p) => (
              <Card key={p.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.process_name}</div>
                  <div className="text-sm text-muted">
                    {p.team_name} | {p.lob} | FTE: {p.current_fte} | Volume: {p.current_volume} | AHT: {p.aht_minutes}m
                  </div>
                </div>
                <Link
                  href={`/processes/${p.id}`}
                  className="rounded-lg border border-brand-blue px-3 py-1.5 text-sm font-semibold text-brand-blue hover:bg-brand-blue-light"
                >
                  Open &rarr;
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="flex items-center justify-between bg-brand-blue-light">
        <div>
          <div className="font-semibold text-brand-blue-dark">Get Started</div>
          <div className="text-sm text-muted">
            Enter process details, add steps, and run the six-agent diagnostic.
          </div>
        </div>
        <Link href="/new">
          <PrimaryButton>🚀 Start New Diagnostic</PrimaryButton>
        </Link>
      </Card>
    </div>
  );
}
