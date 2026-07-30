interface PlaceholderProps {
  label: string;
  className?: string;
}

export function Placeholder({ label, className = "" }: PlaceholderProps) {
  return (
    <div
      className={`flex min-h-[10rem] items-center justify-center rounded-lg border border-dashed border-silver/40 bg-bg-deep/50 p-6 text-center text-sm text-text-muted ${className}`}
      role="img"
      aria-label={label}
    >
      [PLACEHOLDER: {label}]
    </div>
  );
}
