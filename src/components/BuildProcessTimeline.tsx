import { buildProcess } from "@/lib/content";
import type { ProjectWalkthrough } from "@/types/content";

/** Project-specific Question → … → Improve walkthrough table */
export function BuildProcessTimeline({
  walkthrough,
}: {
  walkthrough: ProjectWalkthrough;
}) {
  const stepTitles = buildProcess.steps.map((s) => s.title);

  return (
    <section className="border-t border-white/10 pt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver">
        Build Process
      </p>
      <p className="mt-2 font-display text-sm font-medium text-gold">
        {buildProcess.sequence}
      </p>
      <div className="mt-4 overflow-x-auto border border-white/10 bg-surface-navy">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-surface-navy">
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
            <tr className="bg-surface-navy">
              {walkthrough.cells.map((cell, i) => (
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
    </section>
  );
}
