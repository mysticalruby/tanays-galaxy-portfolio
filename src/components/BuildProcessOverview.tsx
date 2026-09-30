import { buildProcess } from "@/lib/content";

/** Shared Question → Research → Build → Test → Improve definition table */
export function BuildProcessOverview() {
  return (
    <div>
      <p className="mb-4 max-w-3xl text-text-muted">{buildProcess.intro}</p>
      <p className="mb-6 font-display text-sm font-medium text-gold">
        {buildProcess.sequence}
      </p>
      <div className="overflow-x-auto border border-white/10 bg-surface-navy">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-surface-navy">
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
            <tr className="bg-surface-navy">
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
    </div>
  );
}
