import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SkillsTerminal } from "@/components/SkillsTerminal";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Tanay Mangal's skills, grouped by area, each linked to the projects where he used them.",
};

export default function SkillsPage() {
  return (
    <PageShell
      title="Skills"
      description="Each skill links to the projects where I used it. Click a category, or type commands if you like terminals."
    >
      <SkillsTerminal />
    </PageShell>
  );
}
