"use client";

import { Wordmark } from "./Bloom";
import { SectionNav } from "./SectionNav";
import { useScrolled } from "@/lib/scrollStore";

export function Header() {
  const scrolled = useScrolled();
  return (
    <header id="hdr" className={scrolled ? "scrolled" : undefined}>
      <Wordmark href="#top" aria-label="evergreen home" />
      <SectionNav />
      <a className="btn" href="#download">
        Get the app
        <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </header>
  );
}
