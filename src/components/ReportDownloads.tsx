"use client";

import { api } from "@/lib/api";

const REPORT_FORMATS: { fmt: "pdf" | "word" | "excel" | "ppt"; label: string }[] = [
  { fmt: "pdf", label: "📄 PDF" },
  { fmt: "word", label: "📝 Word" },
  { fmt: "excel", label: "📊 Excel" },
  { fmt: "ppt", label: "📽️ PowerPoint" },
];

const TABLE_FORMATS: { fmt: "excel" | "ppt"; label: string }[] = [
  { fmt: "excel", label: "📊 Excel" },
  { fmt: "ppt", label: "📽️ PowerPoint" },
];

function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-lg border border-brand-blue px-4 py-2 font-semibold text-brand-blue hover:bg-brand-blue-light"
    >
      ⬇️ {label}
    </a>
  );
}

export function ReportDownloads({ processId }: { processId: number }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-sm font-semibold text-muted">Full Report Bundle</div>
        <div className="flex flex-wrap gap-3">
          {REPORT_FORMATS.map(({ fmt, label }) => (
            <DownloadLink key={fmt} href={api.reportDownloadUrl(processId, fmt)} label={label} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-muted">Recommendations Table Only</div>
        <div className="flex flex-wrap gap-3">
          {TABLE_FORMATS.map(({ fmt, label }) => (
            <DownloadLink key={fmt} href={api.recommendationsDownloadUrl(processId, fmt)} label={label} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-muted">Golden Benchmark Dataset Used</div>
        <div className="flex flex-wrap gap-3">
          {TABLE_FORMATS.map(({ fmt, label }) => (
            <DownloadLink key={fmt} href={api.goldenDatasetDownloadUrl(fmt)} label={label} />
          ))}
        </div>
      </div>
    </div>
  );
}
