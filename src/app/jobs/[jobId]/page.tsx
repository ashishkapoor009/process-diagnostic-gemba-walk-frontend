"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { JobStatusResponse } from "@/lib/types";
import { Card, SectionHeading } from "@/components/ui";

const STEPS = [
  "🕵️ PE Agent conducting Gemba-walk diagnostic (VA/NVA, Lean waste, root cause)...",
  "⚙️ Automation Agent evaluating RPA / Power Automate / API opportunities...",
  "🤖 AI Agentic Agent evaluating GenAI / Agentic AI opportunities...",
  "📈 Kaizen Agent synthesizing Lean, standardization & roadmap horizons...",
  "🔀 Process Flow Agent generating current & future-state flow...",
  "🧐 Reviewer Agent critically reviewing output, gated by RAGAS evaluation...",
];

export default function JobStatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);

    async function poll() {
      try {
        const status = await api.getJobStatus(jobId);
        setJob(status);
        if (status.status === "completed" && status.process_id) {
          if (pollRef.current) clearInterval(pollRef.current);
          clearInterval(tick);
          router.push(`/processes/${status.process_id}`);
        } else if (status.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          clearInterval(tick);
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to check job status.");
      }
    }

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearInterval(tick);
    };
  }, [jobId, router]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="space-y-6">
      <SectionHeading title="Running Multi-Agent Diagnostic" subtitle="This typically takes 3-8 minutes. Please don't close this tab." />

      <Card>
        <div className="mb-3 text-lg font-semibold text-brand-blue-dark">
          Elapsed: {minutes}m {seconds}s
        </div>
        {job?.status === "failed" ? (
          <div className="text-red-700">
            <strong>Diagnostic failed:</strong> {job.error}
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-muted">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        {error && <p className="mt-3 text-sm text-amber-700">{error}</p>}
        <p className="mt-4 text-xs text-muted">Status: {job?.status ?? "checking..."}</p>
      </Card>
    </div>
  );
}
