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
      description="I am always interested in connecting with students, educators, researchers, and professionals who enjoy learning, solving difficult problems, and doing meaningful technical work."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <Card>
            <p className="text-text-muted">
              Open to conversations about mathematics, engineering, scientific
              modeling, aerospace systems, research, and technical projects.
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
