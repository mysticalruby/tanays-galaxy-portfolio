import type { Metadata } from "next";
import Image from "next/image";
import { AboutGalleries } from "@/components/AboutGalleries";
import { BuildProcessOverview } from "@/components/BuildProcessOverview";
import { Card } from "@/components/Card";
import { PageShell } from "@/components/PageShell";
import { ButtonLink } from "@/components/ButtonLink";
import { aboutGalleries } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "About Tanay Mangal — student researcher, plus cooking and Desmos graphs outside the lab.",
};

const cards = [
  {
    title: "Curiosity",
    body: "I am motivated by questions that are difficult enough to require persistence and creativity.",
  },
  {
    title: "Technical Depth",
    body: "I enjoy understanding the mathematics and science behind a system—not only using tools, but learning why they work.",
  },
  {
    title: "Real-World Impact",
    body: "I am most excited when models, prototypes, and research can help explain or improve real systems.",
  },
];

export default function AboutPage() {
  return (
    <PageShell title="About Me">
      <p className="mb-10 max-w-3xl text-lg text-yellow">
        Student at the Massachusetts Academy of Math and Science at WPI, with
        strong interests in mathematics, science, and engineering.
      </p>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 border border-white/10 bg-black px-5 py-4 text-text-muted">
          <p>
            I am a student at the Massachusetts Academy of Math and Science at
            Worcester Polytechnic Institute (WPI), with strong interests in
            mathematics, science, and engineering. I am especially drawn to
            aerospace and space-related applications, where difficult theoretical
            ideas have to become reliable real-world systems.
          </p>
          <p>
            I enjoy problems that require more than a routine answer. Whether I
            am building a wearable prototype, studying a numerical method in
            physics, or modeling a networked system, I like working through the
            full cycle: understanding the question, learning the background,
            creating a model or prototype, testing it carefully, and improving
            it based on evidence.
          </p>
          <p>
            My academic interests include mathematical modeling, scientific
            computing, engineering design, optimization, control systems,
            embedded sensing, and large-scale simulation.
          </p>
          <p>
            Outside of individual projects, I value collaboration, leadership,
            and helping others learn. My long-term goal is to pursue meaningful
            work at the intersection of mathematics, engineering, and
            science—especially in aerospace, technology, or applied research.
          </p>
          <p>
            If you want to see my school assignments and profile, feel free to
            visit{" "}
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
        <figure className="overflow-hidden border border-white/10 bg-black">
          <div className="relative aspect-square w-full max-w-md bg-black lg:max-w-none">
            <Image
              src="/images/portrait-main.png"
              alt="Portrait of Tanay Mangal speaking at a microphone"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </figure>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-text-primary">
          What drives me
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.title}>
              <h3 className="font-display font-semibold text-blue">{card.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{card.body}</p>
            </Card>
          ))}
        </div>
      </section>

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
