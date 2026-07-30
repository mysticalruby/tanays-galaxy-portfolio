import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { RadarScreen } from "@/components/RadarScreen";
import { exploring } from "@/lib/content";
import type { ExploringTopic } from "@/types/content";

export const metadata: Metadata = {
  title: "Currently Exploring",
  description:
    "Future directions and active interests — FEM, optimization, COMSOL, CAD, and mathematical modeling.",
};

export default function ExploringPage() {
  const topics = exploring.topics as ExploringTopic[];

  return (
    <PageShell
      title={exploring.title}
      description={`${exploring.subtitle}. ${exploring.supporting}`}
    >
      <RadarScreen topics={topics} hint={exploring.radarHint} />
    </PageShell>
  );
}
