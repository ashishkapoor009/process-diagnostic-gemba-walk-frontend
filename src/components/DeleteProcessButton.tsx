"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export function DeleteProcessButton({ processId, processName }: { processId: number; processName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Delete "${processName}"? This permanently removes its diagnostics, recommendations, and reports.`)) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      await api.deleteProcess(processId);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "🗑 Delete"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
