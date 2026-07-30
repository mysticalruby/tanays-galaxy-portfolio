import Link from "next/link";
import { type ReactNode } from "react";

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "gold";
  external?: boolean;
  download?: string | boolean;
  className?: string;
}

const variants = {
  primary: "bg-blue text-bg-deep border-blue hover:bg-blue/90",
  secondary: "bg-transparent text-text-primary border-silver/40 hover:border-blue hover:text-blue",
  gold: "bg-transparent text-gold border-gold/60 hover:bg-gold/10",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  download,
  className = "",
}: ButtonLinkProps) {
  const classes = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium ${variants[variant]} ${className}`;

  if (external || download) {
    return (
      <a
        href={href}
        className={classes}
        {...(download
          ? { download: typeof download === "string" ? download : true }
          : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
