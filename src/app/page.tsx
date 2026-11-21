import type { Metadata } from "next";
import { HomeStory } from "@/components/home/HomeStory";

export const metadata: Metadata = {
  description:
    "Tanay Mangal: computational physics research at WPI, math modeling, FRC Team 190, the Tech Awareness Association, chess, taekwondo and cooking.",
};

export default function HomePage() {
  return <HomeStory />;
}
