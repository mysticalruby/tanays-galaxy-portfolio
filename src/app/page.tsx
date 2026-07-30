import { RocketHub } from "@/components/RocketHub";
import { site } from "@/lib/content";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="mb-10 text-center md:mb-14">
        <h1 className="font-display text-4xl font-bold text-text-primary sm:text-5xl">
          Tanay Mangal
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gold sm:text-xl">
          {site.tagline}
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-text-muted">{site.heroLine}</p>
      </section>
      <RocketHub />
    </div>
  );
}
