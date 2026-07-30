import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { Card } from "@/components/Card";
import { PdfViewer } from "@/components/PdfViewer";
import { Placeholder } from "@/components/Placeholder";
import { getProjectBySlug } from "@/lib/content";
import type { Project } from "@/types/content";

const statusLabels: Record<Project["status"], string> = {
  completed: "Completed",
  collection: "Collection",
  planned: "Planned",
  ongoing: "Ongoing",
};

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

export function ProjectCard({ project }: { project: Project }) {
  const href = `/experience/${project.slug}`;
  const cta = isExperience(project) ? "View experience →" : "View project →";

  return (
    <Card as="article">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue/15 px-2.5 py-0.5 text-xs font-medium text-blue">
          {project.cluster}
        </span>
        <span className="rounded-full border border-silver/30 px-2.5 py-0.5 text-xs text-text-muted">
          {statusLabels[project.status]}
        </span>
        {project.dateRange && (
          <span className="rounded-full border border-silver/20 px-2.5 py-0.5 text-xs text-silver">
            {project.dateRange}
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-text-primary">
        <Link href={href} className="hover:text-blue">
          {project.title}
        </Link>
      </h3>
      {project.organization && (
        <p className="mt-1 text-sm font-medium text-gold">{project.organization}</p>
      )}
      <p className="mt-2 text-sm text-text-muted">{project.summary}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.slice(0, 4).map((tag) => (
          <li
            key={tag}
            className="rounded bg-bg-deep px-2 py-0.5 text-xs text-silver"
          >
            {tag}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-[44px] items-center text-sm font-medium text-blue hover:underline"
      >
        {cta}
      </Link>
    </Card>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const experience = isExperience(project);
  const images = project.images ?? [];
  const hero = images[0];
  const gallery = images.slice(1);
  const papers = resolvePapers(project);

  return (
    <article className="space-y-10">
      <header className="max-w-3xl">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue/15 px-2.5 py-0.5 text-xs font-medium text-blue">
            {project.cluster}
          </span>
          <span className="rounded-full border border-silver/30 px-2.5 py-0.5 text-xs text-text-muted">
            {statusLabels[project.status]}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {project.title}
        </h1>
        {project.subtitle && (
          <p className="mt-2 text-lg text-gold">{project.subtitle}</p>
        )}
        {(project.organization || project.dateRange || project.location) && (
          <dl className="mt-4 space-y-1 text-sm text-text-muted">
            {project.organization && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-silver">Organization</dt>
                <dd>{project.organization}</dd>
              </div>
            )}
            {project.employmentType && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-silver">Role type</dt>
                <dd>{project.employmentType}</dd>
              </div>
            )}
            {project.dateRange && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-silver">Dates</dt>
                <dd>{project.dateRange}</dd>
              </div>
            )}
            {project.location && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-silver">Location</dt>
                <dd>{project.location}</dd>
              </div>
            )}
          </dl>
        )}
        <p className="mt-4 text-lg text-text-muted">{project.opening}</p>
        {(papers.length > 0 ||
          project.websiteUrl ||
          (project.links && project.links.length > 0)) && (
          <div className="mt-5 space-y-3">
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
                <p key={`${link.href}-note`} className="text-sm text-text-muted">
                  {link.note}
                </p>
              ))}
          </div>
        )}
      </header>

      {hero ? (
        <figure className="overflow-hidden rounded-xl border border-silver/20">
          <div className="relative aspect-[16/10] w-full bg-surface-navy">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
          {(hero.caption || hero.alt) && (
            <figcaption className="border-t border-silver/15 px-4 py-2 text-sm text-text-muted">
              {hero.caption ?? hero.alt}
            </figcaption>
          )}
        </figure>
      ) : papers.length === 0 && project.placeholders.length > 0 ? (
        <Placeholder label={`Hero visual for ${project.title}`} className="min-h-[14rem]" />
      ) : null}

      {papers.length > 0 && (
        <section className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-blue">
              {papers.length === 1 ? "Paper" : "Papers"}
            </h2>
          </div>
          {papers.map((paper) => (
            <div key={paper.src} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-base font-semibold text-text-primary">
                  {paper.title}
                </h3>
                <ButtonLink href={paper.src} variant="gold" external>
                  {paper.label ?? "Download PDF"}
                </ButtonLink>
              </div>
              <PdfViewer
                src={paper.src}
                title={paper.title}
                minHeight="36rem"
                aspectRatio={paper.aspectRatio}
              />
            </div>
          ))}
        </section>
      )}

      {project.safetyNote && (
        <Card className="border-yellow/40 bg-yellow/5">
          <p className="text-sm text-yellow">{project.safetyNote}</p>
        </Card>
      )}

      <section>
        <h2 className="font-display text-xl font-semibold text-blue">
          {experience ? "Focus" : "Problem"}
        </h2>
        <p className="mt-2 text-text-muted">{project.problem}</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-blue">Role</h2>
        <p className="mt-2 text-text-muted">{project.role}</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-blue">
          {experience ? "Responsibilities & Work" : "Methods & Technical Build"}
        </h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-text-muted">
          {project.methods.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-blue">
          {experience ? "Impact" : "Results"}
        </h2>
        <p className="mt-2 text-text-muted">{project.results}</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-blue">
          What I Learned
        </h2>
        <p className="mt-2 text-text-muted">{project.learned}</p>
      </section>

      {(gallery.length > 0 || project.placeholders.length > 0) && (
        <section>
          <h2 className="font-display text-xl font-semibold text-blue">
            Technical Evidence
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {gallery.length > 0
              ? gallery.map((img) => (
                  <figure
                    key={img.src}
                    className="overflow-hidden rounded-xl border border-silver/20"
                  >
                    <div className="relative aspect-[4/3] w-full bg-surface-navy">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                    <figcaption className="border-t border-silver/15 px-3 py-2 text-xs text-text-muted">
                      {img.caption ?? img.alt}
                    </figcaption>
                  </figure>
                ))
              : project.placeholders.map((p) => (
                  <Placeholder key={p} label={p} />
                ))}
          </div>
        </section>
      )}

      {project.needsVerification && project.needsVerification.length > 0 && (
        <Card className="border-gold/40">
          <p className="text-sm font-medium text-gold">Needs verification</p>
          <ul className="mt-2 list-inside list-disc text-sm text-text-muted">
            {project.needsVerification.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </Card>
      )}

      <section>
        <h2 className="font-display text-xl font-semibold text-blue">Skills</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {project.skills.map((s) => (
            <li
              key={s}
              className="rounded-full border border-silver/30 px-3 py-1 text-sm text-text-muted"
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      {project.relatedProjects && project.relatedProjects.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-blue">
            Related work
          </h2>
          <ul className="mt-3 space-y-2">
            {project.relatedProjects.map((slug) => {
              const related = getProjectBySlug(slug);
              return (
                <li key={slug}>
                  <Link
                    href={`/experience/${slug}`}
                    className="text-sm font-medium text-blue hover:underline"
                  >
                    {related?.title ?? slug} →
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
