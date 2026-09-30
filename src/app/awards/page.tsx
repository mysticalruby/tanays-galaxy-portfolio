import type { Metadata } from "next";
import { AwardMissionWall } from "@/components/AwardMissionWall";
import { PageShell } from "@/components/PageShell";
import { awards } from "@/lib/content";
export const metadata: Metadata = { title: "Awards & Honors", description: "A mission patch collection of my awards in math, engineering, community service, and more." };
export default function AwardsPage() {
  return <PageShell title="Awards & Honors" description="These are some of the competitions, teams and other things I have been part of over the years, click a patch if you want to see more about that one."><AwardMissionWall awards={awards} /></PageShell>;
}
