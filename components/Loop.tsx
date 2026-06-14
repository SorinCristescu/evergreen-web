"use client";

import { useRef, type ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";

function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg
      className="arrow"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

type Card = { n: string; icon: ReactNode; title: string; desc: string; flip?: boolean };

const CARDS: Card[] = [
  {
    n: "01",
    title: "Identify",
    desc: "Snap a photo — named in a heartbeat, always with an honest confidence score.",
    icon: (
      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L8 6H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-4l-1.5-2Z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Care",
    desc: "An AI care plan nudges you at the right moment — grouped by urgency, never noisy.",
    icon: (
      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c4-3 7-6.5 7-11a7 7 0 0 0-14 0c0 4.5 3 8 7 11Z" />
        <path d="M12 8v6M9 11h6" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Diagnose",
    desc: "Dr. Plant reads a sick leaf and walks you through a step-by-step treatment.",
    icon: (
      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4a7 7 0 1 0 4.9 12l4.1 4.1" />
        <path d="M8 11h6M11 8v6" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Connect",
    desc: "Share wins, swap cuttings, and learn from a community of gardeners.",
    flip: true,
    icon: (
      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.4" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 18a4 4 0 0 1 6 0" />
      </svg>
    ),
  },
];

export function Loop() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section id="loop" className="loop" ref={ref} data-od-id="loop" data-chapter>
      <p className="eyebrow reveal">The whole loop, in one app</p>
      <h2 className="reveal">
        Most apps do one job.
        <br />
        evergreen closes the circle.
      </h2>
      <div className="loop-grid">
        {CARDS.map((c) => (
          <div className="loop-card reveal" key={c.n}>
            <span className="n">{c.n}</span>
            {c.icon}
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <Arrow flip={c.flip} />
          </div>
        ))}
      </div>
    </section>
  );
}
