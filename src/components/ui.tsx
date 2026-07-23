import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 ${className}`}>{children}</div>
  );
}

export function MetricTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <div className="text-2xl font-bold text-brand-blue-dark">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Card>
  );
}

const BADGE_COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-900",
  green: "bg-green-100 text-green-900",
  red: "bg-red-100 text-red-900",
  amber: "bg-amber-100 text-amber-900",
  purple: "bg-purple-100 text-purple-900",
};

export function Badge({ children, color = "blue" }: { children: ReactNode; color?: string }) {
  return (
    <span className={`mr-1.5 mb-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_COLORS[color] ?? BADGE_COLORS.blue}`}>
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
