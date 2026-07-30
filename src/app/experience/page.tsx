import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ExperienceExplorer } from "@/components/ExperienceExplorer";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Projects, research internships, robotics, and leadership — math modeling, engineering, and community work.",
};

export default function ExperiencePage() {
  return (
    <PageShell
      title="Experience"
      description="Research, engineering builds, competitions, and community leadership. Explore by category in the solar system or use the index below."
    >
      <ExperienceExplorer />
    </PageShell>
  );
}
