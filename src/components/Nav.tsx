import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-border bg-brand-blue-dark text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl">🧭</span>
          <span className="font-semibold">Process Diagnostic / Gemba Walk</span>
        </Link>
        <nav className="flex gap-5 text-sm text-blue-100">
          <Link href="/" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/new" className="hover:text-white">
            New Diagnostic
          </Link>
        </nav>
      </div>
    </header>
  );
}
