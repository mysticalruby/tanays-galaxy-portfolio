import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SkillsTerminal } from "@/components/SkillsTerminal";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Interactive skills terminal — explore technical areas and linked project evidence.",
};

export default function SkillsPage() {
  return (
    <PageShell
      title="Skills"
      description="Open the terminal and run commands to browse skills and project evidence."
    >
      <SkillsTerminal />
    </PageShell>
  );
}
