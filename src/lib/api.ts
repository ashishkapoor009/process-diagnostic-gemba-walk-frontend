import type {
  JobStartResponse,
  JobStatusResponse,
  KpiSummary,
  ProcessDetail,
  ProcessMetadata,
  ProcessStepDiagnostic,
  ProcessStepInput,
  ProcessSummary,
  SavingsSummary,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; llm_configured: boolean }>("/health"),

  extractFromText: (rawText: string, processName: string) =>
    request<ProcessStepInput[]>("/api/extract/text", {
      method: "POST",
      body: JSON.stringify({ raw_text: rawText, process_name: processName }),
    }),

  extractFromUpload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/extract/upload`, { method: "POST", body: form });
    if (!res.ok) throw new ApiError(await res.text(), res.status);
    return res.json() as Promise<{ filename: string; used_ocr: boolean; steps: ProcessStepInput[] }>;
  },

  startJob: (metadata: ProcessMetadata, steps: ProcessStepInput[]) =>
    request<JobStartResponse>("/api/jobs", {
      method: "POST",
      body: JSON.stringify({ metadata, steps }),
    }),

  getJobStatus: (jobId: string) => request<JobStatusResponse>(`/api/jobs/${jobId}`),

  listProcesses: () => request<ProcessSummary[]>("/api/processes"),

  getProcess: (id: number) => request<ProcessDetail>(`/api/processes/${id}`),

  updateCurrentStateSteps: (id: number, diagnostics: ProcessStepDiagnostic[]) =>
    request<{
      diagnostics: ProcessStepDiagnostic[];
      savings_summary: SavingsSummary;
      kpi_summary: KpiSummary;
      flow_mermaid_current: string;
    }>(`/api/processes/${id}/steps`, {
      method: "PATCH",
      body: JSON.stringify({ diagnostics }),
    }),

  reportDownloadUrl: (id: number, fmt: "pdf" | "word" | "excel" | "ppt") =>
    `${API_URL}/api/processes/${id}/report/${fmt}`,

  recommendationsDownloadUrl: (id: number, fmt: "excel" | "ppt") =>
    `${API_URL}/api/processes/${id}/recommendations/${fmt}`,

  goldenDatasetDownloadUrl: (fmt: "excel" | "ppt") => `${API_URL}/api/golden-dataset/${fmt}`,
};

export { ApiError, API_URL };
