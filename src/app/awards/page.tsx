import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { ConstellationMap } from "@/components/ConstellationMap";
import { PageShell } from "@/components/PageShell";
import { awards, awardsIntro, getFeaturedAwards } from "@/lib/content";

export const metadata: Metadata = {
  title: "Awards & Honors",
  description:
    "Honors and milestones in mathematical modeling, engineering, leadership, and personal achievement.",
};

export default function AwardsPage() {
  const featured = getFeaturedAwards();

  return (
    <PageShell title="Awards & Honors" description={awardsIntro}>
      <section
        className="relative left-1/2 mb-12 w-screen max-w-[100vw] -translate-x-1/2 px-4 sm:px-8"
        aria-label="Constellation map"
      >
        <ConstellationMap awards={awards} />
      </section>

      <section aria-label="Top honors">
        <h2 className="font-display text-xl font-semibold text-gold">
          Top honors
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Five highlights — explore the full constellation map above for every
          award.
        </p>
        <ol className="mt-6 space-y-4">
          {featured.map((award, index) => (
            <li key={award.id}>
              <Card as="article" id={`award-${award.id}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
                    style={{
                      backgroundColor: `${award.starColor}22`,
                      color: award.starColor,
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-text-primary">
                        {award.name}
                      </h3>
                      {!award.verified && (
                        <span className="rounded bg-silver/15 px-2 py-0.5 text-xs text-silver">
                          To be verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-blue">
                      {award.organization}
                      {award.year ? ` · ${award.year}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-text-muted">
                      {award.description}
                    </p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
