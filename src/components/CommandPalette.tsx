"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { awards, exploring, projects, site, skillCategories } from "@/lib/content";

type Item = { id: string; label: string; hint: string; href: string; keywords: string };

/** Opens with Ctrl/Cmd+K, "/", or the Search button in the header (custom event "open-search"). */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const pages: Item[] = site.nav.map((n) => ({ id: "page-" + n.href, label: n.label, hint: "Page", href: n.href, keywords: "" }));
    pages.push({ id: "page-resume", label: "Résumé", hint: "Page", href: "/resume", keywords: "resume cv pdf" });
    pages.push({ id: "page-academics", label: "Academics site (school coursework)", hint: "users.wpi.edu", href: site.academicsUrl, keywords: "school mams classes assignments coursework" });
    const work: Item[] = projects.map((p) => ({
      id: "exp-" + p.slug,
      label: p.title,
      hint: p.cluster,
      href: `/experience/${p.slug}`,
      keywords: [p.summary, ...(p.tags ?? [])].join(" "),
    }));
    const honors: Item[] = awards.map((a) => ({
      id: "award-" + a.id,
      label: a.name,
      hint: [a.organization, a.year].filter(Boolean).join(", "),
      href: "/awards",
      keywords: a.description ?? "",
    }));
    const skills: Item[] = skillCategories.flatMap((c) =>
      c.skills.map((s) => ({ id: "skill-" + s.id, label: s.name, hint: c.name, href: "/skills", keywords: c.name }))
    );
    const topics: Item[] = exploring.topics.map((t) => ({ id: "explore-" + t.id, label: t.label, hint: "Exploring", href: "/exploring", keywords: t.overview }));
    return [
      { heading: "Pages", items: pages },
      { heading: "Experience", items: work },
      { heading: "Awards", items: honors },
      { heading: "Skills", items: skills },
      { heading: "Exploring", items: topics },
    ];
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("lenis-pause", { detail: open }));
  }, [open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      if (href.startsWith("http")) window.open(href, "_blank", "noopener,noreferrer");
      else router.push(href);
    },
    [router]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="w-full max-w-xl border border-border-muted bg-surface-navy shadow-2xl"
          >
            <Command label="Search the site" loop>
              <Command.Input
                autoFocus
                placeholder="Search experience, awards, skills…"
                className="w-full border-b border-border-muted bg-transparent px-4 py-4 text-base text-text-primary outline-none placeholder:text-text-muted"
              />
              <Command.List className="max-h-[55vh] overflow-y-auto p-2" data-lenis-prevent>
                <Command.Empty className="px-3 py-6 text-sm text-text-muted">Nothing matches that.</Command.Empty>
                {groups.map((g) => (
                  <Command.Group
                    key={g.heading}
                    heading={g.heading}
                    className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-ui [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-gold"
                  >
                    {g.items.map((it) => (
                      <Command.Item
                        key={it.id}
                        value={`${it.label} ${it.hint} ${it.id}`}
                        keywords={[it.keywords]}
                        onSelect={() => go(it.href)}
                        className="flex cursor-pointer items-baseline justify-between gap-4 px-3 py-2 text-sm text-text-primary data-[selected=true]:bg-surface-raised"
                      >
                        <span className="min-w-0 truncate">{it.label}</span>
                        <span className="shrink-0 font-mono text-xs text-text-muted">{it.hint}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
              <div className="flex justify-between border-t border-border-muted px-4 py-2 font-mono text-[11px] text-text-muted">
                <span>↑ ↓ to move · Enter to open</span>
                <span>Esc to close</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
