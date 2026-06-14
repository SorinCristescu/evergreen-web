"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bloom } from "./Bloom";
import { AppStoreButton, GooglePlayButton } from "./StoreButtons";
import { useReveal } from "@/lib/useReveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  // hero bloom drifts up + fades as the hero scrolls away (ported from the export)
  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.to(".bloom-hero", {
        yPercent: -30,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: ref },
  );

  return (
    <section className="hero" ref={ref} data-od-id="hero" data-chapter>
      <div className="hero-inner">
        <Bloom className="bloom-hero" />
        <p className="hero-motto reveal">Grow something alive</p>
        <h1 className="reveal">
          The daily home
          <br />
          for <em>plant people.</em>
        </h1>
        <p className="sub reveal">
          Take a walk through the garden. Hold your phone, and watch evergreen come to life screen by screen — identify, care, diagnose, and connect.
        </p>
        <div className="cta-row reveal">
          <AppStoreButton />
          <GooglePlayButton />
        </div>
      </div>
    </section>
  );
}
