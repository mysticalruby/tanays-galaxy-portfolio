import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildProcess } from "@/lib/content";
import type { ProjectWalkthrough } from "@/types/content";

export const metadata: Metadata = {
  title: "Build Process",
  description:
    "Question → Research → Build → Test → Improve — how Tanay approaches math modeling, coding, and engineering projects.",
};

const CATEGORY_ORDER = [
  "math-modeling",
  "coding-trading",
  "engineering",
] as const;

function groupWalkthroughs(walkthroughs: ProjectWalkthrough[]) {
  const groups = new Map<string, { name: string; items: ProjectWalkthrough[] }>();

  for (const slug of CATEGORY_ORDER) {
    const items = walkthroughs.filter((w) => w.categorySlug === slug);
    if (items.length > 0) {
      groups.set(slug, { name: items[0].category, items });
    }
  }

  return [...groups.values()];
}

export default function BuildProcessPage() {
  const stepTitles = buildProcess.steps.map((s) => s.title);
  const walkthroughs = buildProcess.projectWalkthroughs as ProjectWalkthrough[];
  const grouped = groupWalkthroughs(walkthroughs);

  return (
    <PageShell
      title={buildProcess.title}
      description={buildProcess.intro}
    >
      <p className="mb-8 font-display text-sm font-medium text-gold">
        {buildProcess.sequence}
      </p>

      <div className="overflow-x-auto border border-white/10 bg-black">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-black">
              <th className="w-36 p-4 font-display font-semibold text-text-muted">
                Step
              </th>
              {buildProcess.steps.map((step) => (
                <th
                  key={step.title}
                  className="border-l border-white/10 p-4 font-display font-semibold text-blue"
                >
                  {step.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-black">
              <td className="p-4 font-medium text-text-primary">What it means</td>
              {buildProcess.steps.map((step) => (
                <td
                  key={step.title}
                  className="border-l border-white/10 p-4 text-text-muted"
                >
                  {step.description}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-text-primary">
          How each project follows the loop
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          {walkthroughs.length} experiences across math modeling, coding &amp;
          trading, and engineering — each traced through all five steps.
        </p>

        <div className="mt-8 space-y-12">
          {grouped.map((group) => (
            <div key={group.name}>
              <h3 className="font-display text-xl font-semibold text-blue">
                {group.name}
              </h3>
              <div className="mt-4 space-y-6">
                {group.items.map((project) => (
                  <div
                    key={project.slug}
                    className="overflow-x-auto border border-white/10 bg-black"
                  >
                    <div className="border-b border-white/10 bg-black px-4 py-3">
                      <Link
                        href={project.href}
                        className="font-display font-semibold text-blue transition-colors hover:text-text-primary"
                      >
                        {project.title} →
                      </Link>
                    </div>
                    <table className="w-full min-w-[40rem] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-black">
                          {stepTitles.map((title) => (
                            <th
                              key={title}
                              className="border-l border-white/10 p-3 font-display text-xs font-semibold text-gold first:border-l-0"
                            >
                              {title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-black">
                          {project.cells.map((cell, i) => (
                            <td
                              key={stepTitles[i]}
                              className="border-l border-white/10 p-3 align-top text-text-muted first:border-l-0"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
