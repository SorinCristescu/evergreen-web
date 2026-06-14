"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * GSAP ScrollTrigger staggered reveals for a section.
 *
 * Animates every `.reveal` descendant of `scope` from its CSS-defined hidden
 * state (opacity:0, translateY(46px)) up into place with a stagger as the
 * section scrolls into view. Replaces the export's IntersectionObserver.
 * Respects `prefers-reduced-motion`. Cleanup is handled by `useGSAP`.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const els = gsap.utils.toArray<HTMLElement>(".reveal", root);
      if (!els.length) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }

      ScrollTrigger.batch(els, {
        start: "top 88%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            stagger: 0.12,
            overwrite: true,
          }),
      });
    },
    { scope },
  );
}
