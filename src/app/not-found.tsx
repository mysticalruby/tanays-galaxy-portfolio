import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold text-text-primary">404</h1>
      <p className="mt-4 text-text-muted">This module is not on the mission map.</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-[44px] items-center rounded-md border border-blue bg-blue px-5 py-2.5 text-sm font-medium text-bg-deep"
      >
        Return home
      </Link>
    </div>
  );
}
