import type { Metadata } from "next";
import Image from "next/image";
import { AboutGalleries } from "@/components/AboutGalleries";
import { BuildProcessOverview } from "@/components/BuildProcessOverview";
import { PageShell } from "@/components/PageShell";
import { ButtonLink } from "@/components/ButtonLink";
import { aboutGalleries } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "About Tanay Mangal — student researcher, plus cooking and Desmos graphs outside the lab.",
};

export default function AboutPage() {
  return (
    <PageShell title="About Me">
      <p className="mb-10 max-w-3xl text-lg text-text-muted">
        Senior at the Massachusetts Academy of Math and Science at WPI, from
        Shrewsbury, MA.
      </p>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 text-text-primary">
          <p>
            Most of what I work on ends up somewhere between math, engineering
            and aerospace, because the problems I like best are the ones where
            the math has to turn into something that actually works, whether
            that is a model, a simulation or a thing I can hold.
          </p>
          <p>
            Right now that is computational physics research at WPI, where I
            have been using finite elements on the quantum harmonic oscillator,
            and math modeling competitions like HiMCM, MTFC and IMMC with my
            teams. On the building side, I made a wrist brace that tracks wrist
            angle with two IMUs and warns you before you hold a position that
            leads to carpal tunnel, and I am on the mechanical and fabrication
            subteams for FRC Team 190.
          </p>
          <p>
            Outside of that, I co-founded the Tech Awareness Association, a
            student nonprofit that teaches digital literacy and repairs devices
            around Shrewsbury, I co-founded the Mass Academy Math Tournament,
            and I am a second-degree black belt and taekwondo instructor. I
            also cook a lot, which is most of what the photos below are.
          </p>
          <p className="text-text-muted">
            My junior year coursework from Mass Academy is on my school site,{" "}
            <a
              href="https://users.wpi.edu/~tmangal/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue underline decoration-blue/40 underline-offset-2 transition hover:decoration-blue"
            >
              https://users.wpi.edu/~tmangal/
            </a>
            .
          </p>
        </div>
        <figure className="overflow-hidden border border-white/10 bg-surface-navy">
          <div className="relative aspect-square w-full max-w-md bg-surface-navy lg:max-w-none">
            <Image
              src="/images/tanay-portrait-formal.jpg"
              alt="Portrait of Tanay Mangal wearing a suit"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </figure>
      </div>

      <section id="build-process" className="mt-14 scroll-mt-24">
        <h2 className="font-display text-2xl font-semibold text-text-primary">
          Build Process
        </h2>
        <div className="mt-6">
          <BuildProcessOverview />
        </div>
      </section>

      <AboutGalleries section={aboutGalleries} />

      <div className="mt-10">
        <ButtonLink href="/experience" variant="secondary">
          Explore experience
        </ButtonLink>
      </div>
    </PageShell>
  );
}
