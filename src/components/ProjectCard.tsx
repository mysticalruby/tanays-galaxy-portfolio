import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { BuildProcessTimeline } from "@/components/BuildProcessTimeline";
import { ButtonLink } from "@/components/ButtonLink";
import { PdfViewer } from "@/components/PdfViewer";
import { Placeholder } from "@/components/Placeholder";
import { getProjectBySlug, getWalkthroughBySlug } from "@/lib/content";
import type { Project } from "@/types/content";

function isExperience(project: Project) {
  return project.kind === "experience";
}

function resolvePapers(project: Project) {
  if (project.papers && project.papers.length > 0) return project.papers;
  if (project.paperUrl) {
    return [
      {
        src: project.paperUrl,
        title: project.paperLabel ?? `${project.title} paper`,
        label: project.paperLabel ?? "Download PDF",
      },
    ];
  }
  return [];
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver">
        {title}
      </p>
      <div className="mt-3 text-[0.975rem] leading-relaxed text-text-muted">
        {children}
      </div>
    </section>
  );
}

/** Listing card — experience index boxes only */
export function ProjectCard({ project }: { project: Project }) {
  const href = `/experience/${project.slug}`;
  const cta = isExperience(project) ? "Open experience" : "Open project";

  return (
    <article className="group border border-white/10 bg-surface-navy p-[1px] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-blue/40">
      <div className="bg-surface-navy p-6 sm:p-7">
        <h3 className="font-display text-xl font-semibold tracking-tight text-text-primary transition-colors duration-300 group-hover:text-blue">
          <Link href={href} className="outline-none">
            {project.title}
          </Link>
        </h3>

        {project.organization && (
          <p className="mt-2 font-mono text-xs tracking-wide text-gold">
            {project.organization}
          </p>
        )}

        <p className="mt-3 max-w-prose text-sm leading-relaxed text-text-muted">
          {project.summary}
        </p>

        <Link
          href={href}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 border border-blue/40 bg-blue/10 px-4 py-2 text-sm font-medium text-blue transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue/20 active:scale-[0.98]"
        >
          <span>{cta}</span>
          <span
            aria-hidden
            className="inline-flex h-6 w-6 items-center justify-center border border-blue/30 bg-bg-deep/40 text-xs transition group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

/** Individual experience / project page */
export function ProjectDetail({ project }: { project: Project }) {
  const experience = isExperience(project);
  const images = project.images ?? [];
  const hero = images[0];
  const gallery = images.slice(1);
  const papers = resolvePapers(project);
  const collaborators = project.collaborators ?? [];
  const walkthrough = getWalkthroughBySlug(project.slug);

  return (
    <article className="space-y-12">
      <header className="max-w-3xl border border-white/10 bg-surface-navy p-[1px]">
        <div className="bg-surface-navy px-6 py-8 sm:px-8 sm:py-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl sm:leading-[1.15]">
            {project.title}
          </h1>

          {project.subtitle && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gold sm:text-lg">
              {project.subtitle}
            </p>
          )}

          {(project.organization ||
            project.dateRange ||
            project.location ||
            project.employmentType) && (
            <dl className="mt-6 grid gap-3 border-t border-white/10 pt-5 font-mono text-xs tracking-wide text-text-muted sm:grid-cols-2">
              {project.organization && (
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-silver">
                    Organization
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {project.organization}
                  </dd>
                </div>
              )}
              {project.employmentType && (
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-silver">
                    Role type
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {project.employmentType}
                  </dd>
                </div>
              )}
              {project.dateRange && (
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-silver">
                    Dates
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {project.dateRange}
                  </dd>
                </div>
              )}
              {project.location && (
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-silver">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">
                    {project.location}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <p className="mt-6 max-w-prose text-base leading-relaxed text-text-muted sm:text-lg">
            {project.opening}
          </p>

          {collaborators.length > 0 && (
            <p className="mt-5 max-w-prose text-sm leading-relaxed text-text-muted">
              <span className="text-text-primary">My group: </span>
              {collaborators.map((person, index) => (
                <span key={person.name}>
                  {index > 0 &&
                    (index === collaborators.length - 1 ? ", and " : ", ")}
                  {person.href ? (
                    <a
                      href={person.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue underline decoration-blue/40 underline-offset-2 transition hover:decoration-blue"
                    >
                      {person.name}
                    </a>
                  ) : (
                    person.name
                  )}
                </span>
              ))}
            </p>
          )}

          {(papers.length > 0 ||
            project.websiteUrl ||
            (project.links && project.links.length > 0)) && (
            <div className="mt-7 space-y-3">
              <div className="flex flex-wrap gap-3">
                {project.websiteUrl && (
                  <ButtonLink
                    href={project.websiteUrl}
                    variant="primary"
                    external
                  >
                    {project.websiteLabel ?? "Visit website"}
                  </ButtonLink>
                )}
                {project.links?.map((link) => (
                  <ButtonLink
                    key={link.href}
                    href={link.href}
                    variant="secondary"
                    external
                  >
                    {link.label}
                  </ButtonLink>
                ))}
                {papers.map((paper) => (
                  <ButtonLink
                    key={paper.src}
                    href={paper.src}
                    variant="secondary"
                    external
                  >
                    {paper.label ?? "Download PDF"}
                  </ButtonLink>
                ))}
              </div>
              {project.links
                ?.filter((link) => link.note)
                .map((link) => (
                  <p
                    key={`${link.href}-note`}
                    className="text-sm text-text-muted"
                  >
                    {link.note}
                  </p>
                ))}
            </div>
          )}
        </div>
      </header>

      {hero ? (
        <figure className="border border-border-muted bg-bg-deep p-[1px]">
          <div className="border border-border-muted bg-surface-navy">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
            {(hero.caption || hero.alt) && (
              <figcaption className="border-t border-white/10 px-4 py-3 font-mono text-xs tracking-wide text-text-muted">
                {hero.caption ?? hero.alt}
              </figcaption>
            )}
          </div>
        </figure>
      ) : papers.length === 0 && project.placeholders.length > 0 ? (
        <Placeholder
          label={`Hero visual for ${project.title}`}
          className="min-h-[14rem]"
        />
      ) : null}

      {papers.length > 0 && (
        <section className="space-y-8 border-t border-white/10 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver">
            {papers.length === 1 ? "Paper" : "Papers"}
          </p>
          <div
            className={
              project.paperGrid ? "grid gap-8 md:grid-cols-2" : "space-y-8"
            }
          >
            {papers.map((paper) => (
              <div
                key={paper.src}
                className={`space-y-4 border border-white/10 bg-white/[0.03] p-[1px] ${
                  paper.fullWidth ? "md:col-span-2" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border border-white/[0.06] bg-surface-navy/60 px-4 py-3">
                  <h3 className="font-display text-base font-semibold text-text-primary">
                    {paper.title}
                  </h3>
                  <ButtonLink href={paper.src} variant="gold" external>
                    {paper.label ?? "Download PDF"}
                  </ButtonLink>
                </div>
                <div className="border border-white/[0.06] bg-bg-deep p-2 sm:p-3">
                  <PdfViewer
                    src={paper.src}
                    title={paper.title}
                    minHeight="36rem"
                    aspectRatio={paper.aspectRatio}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {project.safetyNote && (
        <aside className="border border-yellow/35 bg-yellow/[0.06] px-5 py-4">
          <p className="text-sm leading-relaxed text-yellow">
            {project.safetyNote}
          </p>
        </aside>
      )}

      <div className="max-w-3xl space-y-2">
        <DetailSection title={experience ? "Focus" : "Problem"}>
          <p>{project.problem}</p>
        </DetailSection>

        <DetailSection title="Role">
          <p>{project.role}</p>
        </DetailSection>

        <DetailSection
          title={
            experience ? "Responsibilities & Work" : "Methods & Technical Build"
          }
        >
          <ul className="space-y-2">
            {project.methods.map((m) => (
              <li key={m} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2 h-1 w-1 shrink-0 bg-blue"
                />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title={experience ? "Impact" : "Results"}>
          <p>{project.results}</p>
        </DetailSection>

        <DetailSection title="What I Learned">
          <p>{project.learned}</p>
        </DetailSection>
      </div>

      {walkthrough && <BuildProcessTimeline walkthrough={walkthrough} />}

      {(gallery.length > 0 || project.placeholders.length > 0) && (
        <section className="border-t border-white/10 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver">
            Technical Evidence
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {gallery.length > 0
              ? gallery.map((img) => (
                  <figure
                    key={img.src}
                    className="border border-white/10 bg-white/[0.03] p-[1px]"
                  >
                    <div className="border border-white/[0.06] bg-bg-deep">
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                      <figcaption className="border-t border-white/10 px-3 py-2 font-mono text-[11px] tracking-wide text-text-muted">
                        {img.caption ?? img.alt}
                      </figcaption>
                    </div>
                  </figure>
                ))
              : project.placeholders.map((p) => (
                  <Placeholder key={p} label={p} />
                ))}
          </div>
        </section>
      )}

      {project.needsVerification && project.needsVerification.length > 0 && (
        <aside className="border border-gold/40 bg-gold/[0.06] px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
            Needs verification
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-text-muted">
            {project.needsVerification.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </aside>
      )}

      <section className="border-t border-white/10 pt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver">
          Skills
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.skills.map((s) => (
            <li
              key={s}
              className="border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] tracking-wide text-text-muted"
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      {project.relatedProjects && project.relatedProjects.length > 0 && (
        <section className="border-t border-white/10 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver">
            Related work
          </p>
          <ul className="mt-4 space-y-3">
            {project.relatedProjects.map((slug) => {
              const related = getProjectBySlug(slug);
              return (
                <li key={slug}>
                  <Link
                    href={`/experience/${slug}`}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-blue transition hover:text-text-primary"
                  >
                    <span>{related?.title ?? slug}</span>
                    <span
                      aria-hidden
                      className="inline-flex h-6 w-6 items-center justify-center border border-blue/30 text-xs transition group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
