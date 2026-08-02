import type { Metadata } from "next";
import { ExploringAsteroids } from "@/components/ExploringAsteroids";
import { PageShell } from "@/components/PageShell";
import { exploring } from "@/lib/content";
import type { ExploringTopic } from "@/types/content";

export const metadata: Metadata = {
  title: "Currently Exploring",
  description:
    "What Tanay is learning now — Java, FEM, CAD, Python, Arduino, multiphysics, GIS, and more.",
};

export default function ExploringPage() {
  const topics = exploring.topics as ExploringTopic[];

  return (
    <PageShell
      title={exploring.title}
      description={`${exploring.subtitle}. ${exploring.supporting}`}
    >
      <ExploringAsteroids topics={topics} hint={exploring.viewportHint} />
    </PageShell>
  );
}
