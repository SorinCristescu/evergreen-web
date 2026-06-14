"use client";

import { useRef } from "react";
import { AppStoreButton, GooglePlayButton } from "./StoreButtons";
import { useReveal } from "@/lib/useReveal";

export function Download() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section id="download" className="final" ref={ref} data-od-id="download" data-chapter>
      <p className="eyebrow reveal" style={{ justifyContent: "center" }}>
        Bring your garden to life
      </p>
      <h2 className="reveal">
        Step inside
        <br />
        your garden.
      </h2>
      <p className="lede reveal">Identify, care, diagnose, and connect — free to start, on iPhone and Android.</p>
      <div className="cta-row reveal" style={{ marginTop: 34 }}>
        <AppStoreButton />
        <GooglePlayButton />
      </div>
    </section>
  );
}
