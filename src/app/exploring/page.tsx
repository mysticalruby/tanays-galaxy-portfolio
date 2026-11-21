import type { Metadata } from "next";
import { ExploringNotebook } from "@/components/ExploringNotebook";
import { PageShell } from "@/components/PageShell";
import { exploring } from "@/lib/content";

export const metadata: Metadata = {
  title: "Currently Exploring",
  description:
    "What Tanay is learning now: FEM, CAD, OpenRocket, Arduino, multiphysics, MATLAB, GIS and more.",
};

export default function ExploringPage() {
  return (
    <PageShell title="Currently Exploring" description={exploring.supporting}>
      <ExploringNotebook />
    </PageShell>
  );
}
