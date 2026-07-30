import { type ReactNode } from "react";

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-lg text-text-muted">{description}</p>
        )}
      </header>
      {children}
    </div>
  );
}
