import { SaturnScrollExperience } from "@/components/SaturnScrollExperience";
import { site } from "@/lib/content";

export default function HomePage() {
  return <SaturnScrollExperience tagline={site.tagline} heroLine={site.heroLine} />;
}
