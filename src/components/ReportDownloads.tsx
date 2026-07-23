"use client";

import { api } from "@/lib/api";

const FORMATS: { fmt: "pdf" | "word" | "excel" | "ppt"; label: string }[] = [
  { fmt: "pdf", label: "📄 PDF" },
  { fmt: "word", label: "📝 Word" },
  { fmt: "excel", label: "📊 Excel" },
  { fmt: "ppt", label: "📽️ PowerPoint" },
];

export function ReportDownloads({ processId }: { processId: number }) {
  return (
    <div className="flex flex-wrap gap-3">
      {FORMATS.map(({ fmt, label }) => (
        <a
          key={fmt}
          href={api.reportDownloadUrl(processId, fmt)}
          className="rounded-lg border border-brand-blue px-4 py-2 font-semibold text-brand-blue hover:bg-brand-blue-light"
        >
          ⬇️ {label}
        </a>
      ))}
    </div>
  );
}
