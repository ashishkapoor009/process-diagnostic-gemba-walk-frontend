"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { ProcessMetadata, ProcessStepInput, UploadExtractionResult } from "@/lib/types";
import { Card, PrimaryButton, SectionHeading } from "@/components/ui";

const EMPTY_METADATA: ProcessMetadata = {
  process_name: "",
  team_name: "",
  lob: "",
  current_fte: 5,
  current_volume: 1000,
  aht_minutes: 15,
  annual_fte_cost: 35000,
  pain_areas: "",
  dependencies: "",
  customer_complaints: "",
  known_risks: "",
  current_sla: "",
  compliance_requirements: "",
  applications_used: "",
  systems_used: "",
  manual_activities: "",
  automation_already_implemented: "",
};

export default function NewDiagnosticPage() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<ProcessMetadata>(EMPTY_METADATA);
  const [showOptional, setShowOptional] = useState(false);
  const [stepsText, setStepsText] = useState("");
  const [steps, setSteps] = useState<ProcessStepInput[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadExtractionResult | null>(null);

  function updateField<K extends keyof ProcessMetadata>(key: K, value: ProcessMetadata[K]) {
    setMetadata((m) => ({ ...m, [key]: value }));
  }

  async function handleExtract() {
    setError(null);
    setUploadResult(null);
    setExtracting(true);
    try {
      const extracted = await api.extractFromText(stepsText, metadata.process_name);
      setSteps(extracted);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Extraction failed.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleUpload(file: File) {
    setError(null);
    setUploadResult(null);
    setExtracting(true);
    try {
      // The same free-form text box used for manual step entry can also
      // carry an optional instruction for file uploads, e.g. "Extract sheet
      // 3 of the attached file" - the backend only honors it for multi-sheet
      // Excel/CSV uploads, and ignores it entirely otherwise.
      const result = await api.extractFromUpload(file, stepsText);
      setUploadResult(result);
      setSteps(result.steps);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Upload extraction failed.";
      setError(`"${file.name}": ${message}`);
    } finally {
      setExtracting(false);
    }
  }

  async function handleRunDiagnostic() {
    setError(null);
    if (!metadata.process_name || !metadata.team_name || !metadata.lob) {
      setError("Please fill in Process Name, Team Name, and LOB.");
      return;
    }
    if (steps.length === 0) {
      setError("Please add at least one process step.");
      return;
    }
    setSubmitting(true);
    try {
      const { job_id } = await api.startJob(metadata, steps);
      router.push(`/jobs/${job_id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to start diagnostic.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        title="New Process Diagnostic"
        subtitle="Tell us about the process, give us the steps, and run the multi-agent Gemba-walk diagnostic."
      />

      <Card>
        <h3 className="mb-3 font-semibold">1. Process Details</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Process Name*">
            <input className="input" value={metadata.process_name} onChange={(e) => updateField("process_name", e.target.value)} />
          </Field>
          <Field label="Team Name*">
            <input className="input" value={metadata.team_name} onChange={(e) => updateField("team_name", e.target.value)} />
          </Field>
          <Field label="LOB (Line of Business)*">
            <input className="input" value={metadata.lob} onChange={(e) => updateField("lob", e.target.value)} />
          </Field>
          <Field label="Current FTE*">
            <input type="number" step="0.5" className="input" value={metadata.current_fte}
                   onChange={(e) => updateField("current_fte", Number(e.target.value))} />
          </Field>
          <Field label="Current Volume (per period)*">
            <input type="number" step="10" className="input" value={metadata.current_volume}
                   onChange={(e) => updateField("current_volume", Number(e.target.value))} />
          </Field>
          <Field label="AHT (minutes)*">
            <input type="number" step="0.5" className="input" value={metadata.aht_minutes}
                   onChange={(e) => updateField("aht_minutes", Number(e.target.value))} />
          </Field>
          <Field label="Annual FTE Cost ($)*">
            <input type="number" step="1000" className="input" value={metadata.annual_fte_cost}
                   onChange={(e) => updateField("annual_fte_cost", Number(e.target.value))} />
          </Field>
        </div>

        <button
          type="button"
          className="mt-4 text-sm font-semibold text-brand-blue"
          onClick={() => setShowOptional((v) => !v)}
        >
          {showOptional ? "− Hide" : "+"} Optional details (pain areas, dependencies, risks, systems...)
        </button>

        {showOptional && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Pain Areas">
              <textarea className="input" rows={2} value={metadata.pain_areas ?? ""} onChange={(e) => updateField("pain_areas", e.target.value)} />
            </Field>
            <Field label="Dependencies">
              <textarea className="input" rows={2} value={metadata.dependencies ?? ""} onChange={(e) => updateField("dependencies", e.target.value)} />
            </Field>
            <Field label="Customer Complaints">
              <textarea className="input" rows={2} value={metadata.customer_complaints ?? ""} onChange={(e) => updateField("customer_complaints", e.target.value)} />
            </Field>
            <Field label="Known Risks">
              <textarea className="input" rows={2} value={metadata.known_risks ?? ""} onChange={(e) => updateField("known_risks", e.target.value)} />
            </Field>
            <Field label="Current SLA">
              <input className="input" value={metadata.current_sla ?? ""} onChange={(e) => updateField("current_sla", e.target.value)} />
            </Field>
            <Field label="Compliance Requirements">
              <textarea className="input" rows={2} value={metadata.compliance_requirements ?? ""} onChange={(e) => updateField("compliance_requirements", e.target.value)} />
            </Field>
            <Field label="Applications Used">
              <input className="input" value={metadata.applications_used ?? ""} onChange={(e) => updateField("applications_used", e.target.value)} />
            </Field>
            <Field label="Systems Used">
              <input className="input" value={metadata.systems_used ?? ""} onChange={(e) => updateField("systems_used", e.target.value)} />
            </Field>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">2. Process Steps</h3>
        <p className="mb-2 text-sm text-muted">
          Type one step per line, or upload a process map (PDF, DOCX, PPTX, image, CSV, Excel).
        </p>
        <textarea
          className="input"
          rows={6}
          placeholder={"Receive customer request via email\nManually log request in tracking spreadsheet\nRoute to approver for sign-off"}
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted">
          Uploading a multi-sheet Excel/CSV file? You can optionally type which sheet to use above
          (e.g. &quot;use the Process Steps sheet&quot; or &quot;sheet 3&quot;) before clicking Upload -
          otherwise every non-empty sheet is used.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PrimaryButton onClick={handleExtract} disabled={extracting || !stepsText.trim()}>
            {extracting ? "Extracting..." : "🤖 Extract Steps with AI"}
          </PrimaryButton>
          <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface">
            📎 Upload Process Map
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.csv,.xlsx,.xls,.bpmn,.xml"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </label>
          {extracting && <span className="text-sm text-muted">Extracting...</span>}
          {!extracting && steps.length > 0 && <span className="text-sm text-muted">{steps.length} step(s) extracted.</span>}
        </div>

        {uploadResult && (
          <div className="mt-4 rounded-lg border border-border bg-surface p-3 text-sm">
            <p className="font-semibold">
              📎 {uploadResult.filename}
              {uploadResult.file_type && <span className="ml-2 font-normal text-muted">({uploadResult.file_type}{uploadResult.used_ocr ? ", OCR" : ""})</span>}
            </p>
            {uploadResult.sources.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-0.5 text-muted">
                {uploadResult.sources.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            {uploadResult.warning && (
              <p className="mt-2 text-amber-700">⚠️ {uploadResult.warning}</p>
            )}
          </div>
        )}

        {steps.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="py-1 pr-3">#</th>
                  <th className="py-1 pr-3">Step</th>
                  <th className="py-1 pr-3">Owner</th>
                  <th className="py-1 pr-3">System</th>
                  <th className="py-1 pr-3">Cycle Time (m)</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s) => (
                  <tr key={s.step_number} className="border-b border-border">
                    <td className="py-1 pr-3">{s.step_number}</td>
                    <td className="py-1 pr-3">{s.step_name}</td>
                    <td className="py-1 pr-3">{s.owner ?? "-"}</td>
                    <td className="py-1 pr-3">{s.system_used ?? "-"}</td>
                    <td className="py-1 pr-3">{s.cycle_time_minutes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {error && (
        <Card className="border-red-300 bg-red-50 text-red-900">{error}</Card>
      )}

      <Card>
        <h3 className="mb-2 font-semibold">3. Run Multi-Agent Diagnostic</h3>
        <p className="mb-3 text-sm text-muted">
          Typically takes <strong>3-8 minutes</strong> - six agents run sequentially, and the Reviewer
          Agent&apos;s RAGAS evaluation (4 LLM-judged metrics, up to 2 rounds) alone can take 1-3 minutes.
        </p>
        <PrimaryButton onClick={handleRunDiagnostic} disabled={submitting}>
          {submitting ? "Starting..." : "▶️ Run Multi-Agent Diagnostic"}
        </PrimaryButton>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
