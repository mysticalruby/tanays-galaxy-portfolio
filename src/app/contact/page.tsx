import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { ButtonLink } from "@/components/ButtonLink";
import { PdfViewer } from "@/components/PdfViewer";
import { resume, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Me",
  description:
    "Get in touch with Tanay Mangal and view his résumé — education, projects, skills, and honors.",
};

export default function ContactPage() {
  const { contact } = site;

  return (
    <PageShell
      title="Contact Me"
      description="Email is the fastest way to reach me. I usually answer within a day or two."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <Card>
            <p className="text-text-muted">
              If you are working on something in modeling, simulation,
              robotics or aerospace and want another person on it, or you just
              have a question about one of my projects, send me a message.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink
                href={`mailto:${contact.email}`}
                variant="primary"
                external
              >
                Email: {contact.emailLabel}
              </ButtonLink>
              <ButtonLink
                href={contact.linkedin}
                variant="secondary"
                external
              >
                {contact.linkedinLabel}
              </ButtonLink>
              <ButtonLink
                href={contact.github}
                variant="secondary"
                external
              >
                {contact.githubLabel}
              </ButtonLink>
            </div>
          </Card>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Résumé
            </h2>
            <ButtonLink
              href={resume.pdfPath}
              variant="primary"
              external
              download="tanay-mangal-resume.pdf"
            >
              Download PDF
            </ButtonLink>
          </div>
          <Card className="p-0 overflow-hidden">
            <PdfViewer
              src={resume.pdfPath}
              title="Résumé PDF preview"
              minHeight="32rem"
            />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
