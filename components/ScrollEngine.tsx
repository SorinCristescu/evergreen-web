"use client";

import { useEffect } from "react";
import { STEPS } from "@/lib/steps";
import { setScrollState, setPointer } from "@/lib/scrollStore";

const CHAPTER_IDS = ["top", "loop", "walk", "pricing", "download"];

/**
 * Installs the global scroll/resize/pointer listeners and pushes derived values
 * into the scroll store (ports the export's inline scroll engine + pointer
 * tracking). Renders nothing.
 */
export function ScrollEngine() {
  useEffect(() => {
    const N = STEPS.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = "ontouchstart" in window;
    let maxScroll = 1;

    const measure = () => {
      maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    };

    const onScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollP = Math.min(1, Math.max(0, scrollY / maxScroll));

      const walk = document.getElementById("walk");
      let walkStep = 0;
      if (walk) {
        const top = walk.offsetTop;
        const h = walk.offsetHeight - window.innerHeight;
        const local = Math.min(1, Math.max(0, (scrollY - top) / Math.max(1, h)));
        walkStep = Math.min(N - 1, Math.floor(local * N));
      }

      const mid = scrollY + window.innerHeight * 0.42;
      let sectionIndex = 0;
      for (let i = 0; i < CHAPTER_IDS.length; i++) {
        const el = document.getElementById(CHAPTER_IDS[i]);
        if (el && el.offsetTop <= mid) sectionIndex = i;
      }

      setScrollState({ scrollP, scrolled: scrollY > 24, walkStep, sectionIndex });
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    const onPointerMove = (e: MouseEvent) => {
      setPointer(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    };

    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (!isTouch && !reduce) {
      window.addEventListener("mousemove", onPointerMove, { passive: true });
    }
    // re-measure after fonts/images settle
    const t = window.setTimeout(onResize, 400);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onPointerMove);
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
