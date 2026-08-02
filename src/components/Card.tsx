import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
  id?: string;
}

export function Card({ children, className = "", as: Tag = "div", id }: CardProps) {
  return (
    <Tag
      id={id}
      className={`rounded-none border border-white/10 bg-black p-5 sm:p-6 ${className}`}
    >
      {children}
    </Tag>
  );
}
