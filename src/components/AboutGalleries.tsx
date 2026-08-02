"use client";

import Image from "next/image";
import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";
import { SlideshowGallery } from "@/components/SlideshowGallery";
import type { AboutGallery, GalleriesSection, GalleryItem } from "@/types/content";

interface AboutGalleriesProps {
  section: GalleriesSection;
}

function renderMedia(item: GalleryItem) {
  if (item.embedUrl) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={item.embedUrl}
        title={item.embedTitle ?? item.caption}
        loading="lazy"
        allowFullScreen
      />
    );
  }

  if (item.imageSrc) {
    return (
      <Image
        src={item.imageSrc}
        alt={item.caption}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 50vw"
      />
    );
  }

  return (
    <Placeholder
      label={item.placeholder ?? "Media placeholder"}
      className="h-full min-h-[16rem] rounded-none border-0 sm:min-h-[18rem]"
    />
  );
}

function GalleryPanel({ gallery }: { gallery: AboutGallery }) {
  const isEmbedGallery = gallery.items.some((item) => Boolean(item.embedUrl));
  const slides = gallery.items.map((item) => ({
    id: item.id,
    label: item.caption,
    caption: item.caption,
    children: renderMedia(item),
  }));

  return (
    <article className="flex h-full flex-col border border-white/10 bg-black p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-gold">{gallery.title}</h3>
      <p className="mt-1.5 text-sm text-text-muted">{gallery.description}</p>

      <SlideshowGallery
        className="mt-4 flex-1"
        hiddenTitle={`${gallery.title} gallery`}
        slides={slides}
        compact
        embed={isEmbedGallery}
      />

      {gallery.relatedHref && gallery.relatedLabel && (
        <Link
          href={gallery.relatedHref}
          className="mt-3 inline-flex min-h-[44px] items-center text-sm font-medium text-blue hover:underline"
        >
          {gallery.relatedLabel}
        </Link>
      )}
    </article>
  );
}

export function AboutGalleries({ section }: AboutGalleriesProps) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-semibold text-text-primary">
        {section.title}
      </h2>
      <p className="mt-3 max-w-3xl text-text-muted">{section.intro}</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {section.galleries.map((gallery) => (
          <GalleryPanel key={gallery.id} gallery={gallery} />
        ))}
      </div>
    </section>
  );
}
