import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Evidence-linked skills from AI, modeling, engineering, and trading projects — browse by skill in the terminal.",
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
