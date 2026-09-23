"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProcessStepDiagnostic } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { PrimaryButton } from "@/components/ui";

const VALUE_CLASSES: ProcessStepDiagnostic["value_classification"][] = [
  "Value Added",
  "Non-Value Added",
  "Business Non-Value Added",
];

const LEAN_WASTES = [
  "Transportation", "Inventory", "Motion", "Waiting", "Overprocessing",
  "Overproduction", "Defects", "Unused Talent", "Hand-offs", "Bottleneck",
  "Rework", "Queue Time", "Delay", "Approvals",
];

export function EditableDiagnosticsTable({
  processId,
  diagnostics,
}: {
  processId: number;
  diagnostics: ProcessStepDiagnostic[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState<ProcessStepDiagnostic[]>(diagnostics);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(stepNumber: number, patch: Partial<ProcessStepDiagnostic>) {
    setRows((prev) => prev.map((d) => (d.step_number === stepNumber ? { ...d, ...patch } : d)));
  }

  function toggleWaste(stepNumber: number, waste: string) {
    setRows((prev) =>
      prev.map((d) => {
        if (d.step_number !== stepNumber) return d;
        const has = d.lean_wastes.includes(waste);
        return { ...d, lean_wastes: has ? d.lean_wastes.filter((w) => w !== waste) : [...d.lean_wastes, waste] };
      })
    );
  }

  function cancel() {
    setRows(diagnostics);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api.updateCurrentStateSteps(processId, rows);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {editing
            ? "Editing is optional — correct any field below, then save. Recommendations and the executive summary are not regenerated."
            : "Values shown are what the PE Agent diagnosed. You can correct them if needed."}
        </p>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={cancel}
              disabled={saving}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface disabled:opacity-50"
            >
              Cancel
            </button>
            <PrimaryButton onClick={save} disabled={saving} className="px-3 py-1.5 text-sm">
              {saving ? "Saving…" : "Save Changes"}
            </PrimaryButton>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-brand-blue px-3 py-1.5 text-sm font-semibold text-brand-blue hover:bg-brand-blue-light"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

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
            {rows.map((d) => (
              <tr key={d.step_number} className="border-t border-border align-top">
                <Td>{d.step_number}</Td>
                {editing ? (
                  <>
                    <Td>
                      <input
                        className="w-40 rounded border border-border bg-transparent px-2 py-1"
                        value={d.step_name}
                        onChange={(e) => updateRow(d.step_number, { step_name: e.target.value })}
                      />
                    </Td>
                    <Td>
                      <input
                        className="w-32 rounded border border-border bg-transparent px-2 py-1"
                        value={d.owner}
                        onChange={(e) => updateRow(d.step_number, { owner: e.target.value })}
                      />
                    </Td>
                    <Td>
                      <select
                        className="rounded border border-border bg-transparent px-2 py-1"
                        value={d.value_classification}
                        onChange={(e) =>
                          updateRow(d.step_number, {
                            value_classification: e.target.value as ProcessStepDiagnostic["value_classification"],
                          })
                        }
                      >
                        {VALUE_CLASSES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </Td>
                    <Td>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        className="w-16 rounded border border-border bg-transparent px-2 py-1"
                        value={d.cycle_time_minutes}
                        onChange={(e) => updateRow(d.step_number, { cycle_time_minutes: Number(e.target.value) })}
                      />
                    </Td>
                    <Td>
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {LEAN_WASTES.map((w) => {
                          const active = d.lean_wastes.includes(w);
                          return (
                            <button
                              key={w}
                              type="button"
                              onClick={() => toggleWaste(d.step_number, w)}
                              className={`rounded-full border px-2 py-0.5 text-xs ${
                                active ? "border-brand-blue bg-brand-blue-light text-brand-blue-dark" : "border-border text-muted"
                              }`}
                            >
                              {w}
                            </button>
                          );
                        })}
                      </div>
                    </Td>
                    <Td>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-16 rounded border border-border bg-transparent px-2 py-1"
                        value={d.automation_score}
                        onChange={(e) => updateRow(d.step_number, { automation_score: Number(e.target.value) })}
                      />
                    </Td>
                    <Td>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-16 rounded border border-border bg-transparent px-2 py-1"
                        value={d.ai_readiness_score}
                        onChange={(e) => updateRow(d.step_number, { ai_readiness_score: Number(e.target.value) })}
                      />
                    </Td>
                  </>
                ) : (
                  <>
                    <Td>{d.step_name}</Td>
                    <Td>{d.owner}</Td>
                    <Td>{d.value_classification}</Td>
                    <Td>{d.cycle_time_minutes}</Td>
                    <Td>{d.lean_wastes.join(", ") || "None"}</Td>
                    <Td>{d.automation_score}</Td>
                    <Td>{d.ai_readiness_score}</Td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
