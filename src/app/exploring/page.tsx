import type { Metadata } from "next";
import { ExploringWorkbench } from "@/components/ExploringWorkbench";

export const metadata: Metadata = {
  title: "Currently Exploring",
  description:
    "What Tanay is learning now — FEM, CAD, OpenRocket, Arduino, multiphysics, MATLAB, GIS, and more.",
};

export default function ExploringPage() {
  return (
    <ExploringWorkbench />
  );
}
