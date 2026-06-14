"use client";

import { useSectionIndex } from "@/lib/scrollStore";

const DOTS = [
  { jump: "#top", label: "Intro" },
  { jump: "#loop", label: "The loop" },
  { jump: "#walk", label: "The walk" },
  { jump: "#pricing", label: "Plans" },
  { jump: "#download", label: "Get it" },
];

export function SectionNav() {
  const active = useSectionIndex();

  const onJump = (sel: string) => {
    const t = document.querySelector(sel) as HTMLElement | null;
    if (!t) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: t.offsetTop, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <nav className="dots" aria-label="Sections">
      {DOTS.map((d, i) => (
        <a key={d.jump} data-jump={d.jump} className={i === active ? "active" : undefined} onClick={() => onJump(d.jump)}>
          <span className="lbl">{d.label}</span>
          <span className="d" />
        </a>
      ))}
    </nav>
  );
}
