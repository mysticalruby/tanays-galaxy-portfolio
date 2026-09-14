"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjectBySlug, skillCategories, skillsIntro } from "@/lib/content";
import type { SkillCategoryGroup, SkillItem } from "@/types/content";

const COMMANDS = ["help", "list", "ls", "skills", "clear", "close", "back", "open"] as const;

const WELCOME = [
  "tanay@galaxy:~$ skills-terminal v1.0",
  "Type a command and press Enter. Try: help",
  "",
];

type HistoryLine = {
  id: number;
  kind: "system" | "input" | "output";
  text: string;
};

function shortTitle(title: string) {
  return title.split(":")[0];
}

function categoryListLines(): string[] {
  const n = skillCategories.length;
  return [
    "SKILL CATEGORIES",
    "────────────────",
    ...skillCategories.map(
      (c, i) => `[${i + 1}] ${c.name} (${c.skills.length} skills)`
    ),
    "",
    `Enter a number (1–${n}) to open a category.`,
  ];
}

function helpLines(): string[] {
  const n = skillCategories.length;
  return [
    "AVAILABLE COMMANDS",
    "──────────────────",
    "  help     — show this message",
    "  list     — list skill categories (aliases: ls, skills)",
    `  open <n> — open category panel (e.g. open 3)`,
    `  <n>      — after list, type 1–${n} to open a category`,
    "  back     — return from a skill to its category",
    "  clear    — clear terminal output",
    "  close    — close the detail panel",
    "",
    "In the panel: pick a specific skill, then ↑ ↓ projects · Enter to open.",
  ];
}

function getProjectsForSkill(skill: SkillItem) {
  return skill.projectSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
}

export function SkillsTerminal() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineId = useRef(0);

  const [history, setHistory] = useState<HistoryLine[]>(() =>
    WELCOME.map((text) => ({
      id: lineId.current++,
      kind: "system",
      text,
    }))
  );
  const [input, setInput] = useState("");
  const [categoryListActive, setCategoryListActive] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<SkillCategoryGroup | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [skillIndex, setSkillIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);

  const projects = useMemo(
    () => (selectedSkill ? getProjectsForSkill(selectedSkill) : []),
    [selectedSkill]
  );

  const autocomplete = useMemo(() => {
    const trimmed = input.trimStart().toLowerCase();
    if (!trimmed) return null;
    const match = COMMANDS.find(
      (cmd) => cmd.startsWith(trimmed) && cmd !== trimmed
    );
    if (!match) return null;
    return match.slice(trimmed.length);
  }, [input]);

  const appendLines = useCallback(
    (lines: string[], kind: HistoryLine["kind"] = "output") => {
      setHistory((prev) => [
        ...prev,
        ...lines.map((text) => ({
          id: lineId.current++,
          kind,
          text,
        })),
      ]);
    },
    []
  );

  const openCategory = useCallback(
    (index: number) => {
      const category = skillCategories[index];
      if (!category) {
        appendLines([`Error: no category at index ${index + 1}.`]);
        return;
      }
      setSelectedCategory(category);
      setSelectedSkill(null);
      setSkillIndex(0);
      setProjectIndex(0);
      appendLines([`Opening category: ${category.name}`]);
    },
    [appendLines]
  );

  const openSkill = useCallback((skill: SkillItem, index: number) => {
    setSelectedSkill(skill);
    setSkillIndex(index);
    setProjectIndex(0);
  }, []);

  const backToCategory = useCallback(() => {
    if (!selectedSkill) return;
    setSelectedSkill(null);
    setProjectIndex(0);
    appendLines(["Returned to category skill list."]);
  }, [appendLines, selectedSkill]);

  const closePanel = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSkill(null);
    setSkillIndex(0);
    setProjectIndex(0);
    appendLines(["Panel closed."]);
  }, [appendLines]);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;

      setHistory((prev) => [
        ...prev,
        { id: lineId.current++, kind: "input", text: `tanay@galaxy:~$ ${cmd}` },
      ]);

      const lower = cmd.toLowerCase();

      if (selectedCategory && lower === "close") {
        closePanel();
        return;
      }

      if (selectedCategory && lower === "back" && selectedSkill) {
        backToCategory();
        return;
      }

      if (/^\d+$/.test(cmd) && categoryListActive && !selectedCategory) {
        openCategory(parseInt(cmd, 10) - 1);
        return;
      }

      const openMatch = lower.match(/^open\s+(\d+)$/);
      if (openMatch && !selectedCategory) {
        openCategory(parseInt(openMatch[1], 10) - 1);
        return;
      }

      switch (lower) {
        case "help":
          appendLines(helpLines());
          break;
        case "list":
        case "ls":
        case "skills":
          appendLines(categoryListLines());
          setCategoryListActive(true);
          break;
        case "clear":
          setHistory([]);
          setCategoryListActive(false);
          break;
        case "back":
          if (selectedSkill) backToCategory();
          else appendLines(["Already at category level."]);
          break;
        case "close":
          if (selectedCategory) closePanel();
          else appendLines(["No panel is open."]);
          break;
        default:
          appendLines([
            `Command not found: ${cmd}`,
            "Type help for available commands.",
          ]);
      }
    },
    [
      appendLines,
      backToCategory,
      categoryListActive,
      closePanel,
      openCategory,
      selectedCategory,
      selectedSkill,
    ]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && autocomplete) {
      e.preventDefault();
      setInput((v) => v + autocomplete);
      return;
    }
    if (
      e.key === "ArrowRight" &&
      autocomplete &&
      e.currentTarget.selectionStart === input.length
    ) {
      e.preventDefault();
      setInput((v) => v + autocomplete);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history, selectedCategory, selectedSkill]);

  useEffect(() => {
    if (!selectedCategory) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePanel();
        return;
      }

      if (!selectedSkill) {
        const skills = selectedCategory.skills;
        if (skills.length === 0) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSkillIndex((i) => (i + 1) % skills.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSkillIndex((i) => (i - 1 + skills.length) % skills.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const skill = skills[skillIndex];
          if (skill) openSkill(skill, skillIndex);
        }
        return;
      }

      if (projects.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setProjectIndex((i) => (i + 1) % projects.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setProjectIndex((i) => (i - 1 + projects.length) % projects.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const proj = projects[projectIndex];
        if (proj) router.push(`/experience/${proj.slug}`);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backToCategory();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    backToCategory,
    closePanel,
    openSkill,
    projectIndex,
    projects,
    router,
    selectedCategory,
    selectedSkill,
    skillIndex,
  ]);

  const panelOpen = Boolean(selectedCategory);

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="rounded-t-2xl border border-silver/20 bg-gradient-to-b from-surface-raised to-surface-navy px-4 pb-3 pt-4 shadow-2xl">
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-rocket-red/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue/80" />
          <span className="ml-2 font-mono text-xs tracking-wide text-silver/70">
            skills-terminal — galaxy.local
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border-2 border-border-muted bg-bg-deep shadow-inner">
          <div
            ref={scrollRef}
            className="h-[min(52vh,28rem)] overflow-y-auto p-4 font-mono text-sm leading-relaxed text-text-primary"
            aria-live="polite"
          >
            {history.map((line) => {
              const categoryMatch = line.text.match(/^\[(\d+)\]/);
              const categoryIdx = categoryMatch
                ? parseInt(categoryMatch[1], 10) - 1
                : null;

              if (categoryIdx !== null && categoryListActive && !panelOpen) {
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => openCategory(categoryIdx)}
                    className="block w-full text-left hover:bg-blue/10 hover:text-yellow"
                  >
                    {line.text}
                  </button>
                );
              }

              return (
                <div
                  key={line.id}
                  className={
                    line.kind === "input"
                      ? "text-blue/90"
                      : line.kind === "system"
                        ? "text-text-muted"
                        : ""
                  }
                >
                  {line.text || "\u00A0"}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border-muted bg-surface-navy px-4 py-3"
          >
            <span className="shrink-0 font-mono text-sm text-blue/80">
              tanay@galaxy:~$
            </span>
            <div className="relative min-w-0 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={panelOpen}
                autoComplete="off"
                spellCheck={false}
                aria-label="Terminal command input"
                className="w-full bg-transparent font-mono text-sm text-text-primary outline-none placeholder:text-text-muted/50 disabled:opacity-50"
                placeholder={panelOpen ? "close panel to type…" : "help"}
              />
              {autocomplete && !panelOpen && (
                <span
                  className="pointer-events-none absolute left-0 top-0 font-mono text-sm"
                  aria-hidden
                >
                  <span className="invisible">{input}</span>
                  <span className="text-text-muted/50">{autocomplete}</span>
                </span>
              )}
            </div>
          </form>
        </div>

        <div className="mx-auto mt-2 h-1.5 w-3 rounded-full bg-silver/30" />
      </div>

      <div className="mx-auto h-6 w-24 bg-gradient-to-b from-surface-navy to-bg-deep" />
      <div className="mx-auto h-2 w-40 rounded-full bg-surface-navy shadow-lg" />

      <p className="mt-6 text-center text-sm text-text-muted">
        {skillsIntro} Type{" "}
        <kbd className="rounded border border-silver/30 px-1.5 py-0.5 font-mono text-xs text-blue/90">
          skills
        </kbd>{" "}
        to browse nine categories, then pick a specific skill in the panel.
      </p>

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col border-l border-silver/25 bg-surface-navy shadow-2xl transition-transform duration-300 ease-out ${
          panelOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!panelOpen}
        aria-label={
          selectedCategory
            ? selectedSkill
              ? `${selectedSkill.name} skill details`
              : `${selectedCategory.name} skills`
            : undefined
        }
      >
        {selectedCategory && (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-silver/20 p-5">
              <div className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-wider text-blue/80">
                  {selectedSkill ? "skill.load()" : "category.load()"}
                </p>
                {selectedSkill ? (
                  <>
                    <button
                      type="button"
                      onClick={backToCategory}
                      className="mt-1 block truncate text-left font-mono text-xs text-blue hover:underline"
                    >
                      ← {selectedCategory.name}
                    </button>
                    <h2 className="mt-1 font-display text-xl font-semibold text-text-primary">
                      {selectedSkill.name}
                    </h2>
                    <span className="mt-2 inline-block rounded bg-gold/15 px-2 py-0.5 text-xs text-gold">
                      {selectedSkill.level}
                    </span>
                  </>
                ) : (
                  <h2 className="mt-1 font-display text-xl font-semibold text-text-primary">
                    {selectedCategory.name}
                  </h2>
                )}
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="shrink-0 rounded-md border border-silver/30 px-2 py-1 font-mono text-xs text-text-muted hover:border-blue hover:text-blue"
              >
                esc
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!selectedSkill ? (
                <>
                  <p className="text-sm text-text-muted">
                    {selectedCategory.meaning}
                  </p>

                  <h3 className="mt-5 font-display text-sm font-semibold text-blue">
                    Growing toward
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">
                    {selectedCategory.growing}
                  </p>

                  <h3 className="mt-6 font-display text-sm font-semibold text-yellow">
                    Specific skills
                  </h3>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    ↑ ↓ navigate · Enter to open
                  </p>
                  <ul className="mt-3 space-y-2">
                    {selectedCategory.skills.map((skill, i) => (
                      <li key={skill.id}>
                        <button
                          type="button"
                          onClick={() => openSkill(skill, i)}
                          onMouseEnter={() => setSkillIndex(i)}
                          className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                            i === skillIndex
                              ? "border-blue bg-blue/10 text-text-primary"
                              : "border-silver/20 text-text-muted hover:border-silver/40"
                          }`}
                        >
                          <span className="font-mono text-xs text-blue/80">
                            [{i + 1}]
                          </span>
                          <span className="mt-1 block font-display font-medium">
                            {skill.name}
                          </span>
                          <span className="mt-1 block text-xs opacity-80">
                            {skill.projectSlugs.length} linked project
                            {skill.projectSlugs.length === 1 ? "" : "s"} ·{" "}
                            {skill.level}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-sm text-text-muted">
                    {selectedSkill.meaning}
                  </p>

                  <h3 className="mt-5 font-display text-sm font-semibold text-blue">
                    Evidence
                  </h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-text-muted">
                    {selectedSkill.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <h3 className="mt-5 font-display text-sm font-semibold text-blue">
                    Growing toward
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">
                    {selectedSkill.growing}
                  </p>

                  <h3 className="mt-6 font-display text-sm font-semibold text-yellow">
                    Projects
                  </h3>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    ↑ ↓ navigate · Enter to open · Backspace to go back
                  </p>
                  <ul className="mt-3 space-y-2">
                    {projects.map((proj, i) => (
                      <li key={proj.slug}>
                        <button
                          type="button"
                          onClick={() => router.push(`/experience/${proj.slug}`)}
                          onMouseEnter={() => setProjectIndex(i)}
                          className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                            i === projectIndex
                              ? "border-blue bg-blue/10 text-text-primary"
                              : "border-silver/20 text-text-muted hover:border-silver/40"
                          }`}
                        >
                          <span className="font-mono text-xs text-blue/80">
                            [{i + 1}]
                          </span>
                          <span className="mt-1 block font-display font-medium">
                            {shortTitle(proj.title)}
                          </span>
                          <span className="mt-1 block text-xs opacity-80">
                            {proj.summary}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {panelOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-bg-deep/60 backdrop-blur-[2px]"
          aria-label="Close skill panel"
          onClick={closePanel}
        />
      )}
    </div>
  );
}
