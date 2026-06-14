"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function Pricing() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section id="pricing" className="pricing" ref={ref} data-od-id="pricing" data-chapter>
      <p className="eyebrow reveal" style={{ justifyContent: "center" }}>
        Plans
      </p>
      <h2 className="reveal">
        Start free.
        <br />
        Grow with Evergreen+.
      </h2>
      <p className="lede reveal" style={{ marginInline: "auto", textAlign: "center" }}>
        Everything you need to keep a few plants thriving is free, forever. Upgrade when your collection — and your ambitions — outgrow it.
      </p>
      <div className="price-grid">
        <div className="price-card reveal">
          <div className="pname">Free</div>
          <p className="ptag">For getting started with your first few plants.</p>
          <div className="pcost">
            <b>$0</b>
            <span className="per">/ forever</span>
          </div>
          <span className="pnote">No card required</span>
          <a className="buy" href="#download">
            Get the app
          </a>
          <p className="feat-h">What&apos;s included</p>
          <ul>
            <li>
              <Check />
              <span>
                <b>Identify with the camera</b> — Plant.id &amp; Pl@ntNet with honest confidence
              </span>
            </li>
            <li>
              <Check />
              <span>
                <b>Care plans for up to 5 plants</b> with Today reminders
              </span>
            </li>
            <li>
              <Check />
              <span>Garden organized by Place &amp; Space</span>
            </li>
            <li>
              <Check />
              <span>Weather advisory for 1 Location</span>
            </li>
            <li>
              <Check />
              <span>Community feed — read, post &amp; swap</span>
            </li>
          </ul>
        </div>

        <div className="price-card featured reveal">
          <span className="badge">Most popular</span>
          <div className="pname">Evergreen+</div>
          <p className="ptag">For collectors and anyone who wants every plant to thrive.</p>
          <div className="pcost">
            <b>$4.99</b>
            <span className="per">/ month</span>
          </div>
          <span className="pnote">or $39.99 / year · cancel anytime</span>
          <a className="buy" href="#download">
            Start Evergreen+
          </a>
          <p className="feat-h">Everything in Free, plus</p>
          <ul>
            <li>
              <Check />
              <span>
                <b>Unlimited plants</b> across every Location
              </span>
            </li>
            <li>
              <Check />
              <span>
                <b>Advanced AI care plans</b> with seasonal tuning
              </span>
            </li>
            <li>
              <Check />
              <span>
                <b>Unlimited Dr. Plant</b> diagnosis &amp; treatment plans
              </span>
            </li>
            <li>
              <Check />
              <span>
                Weather advisories for <b>every Location</b>
              </span>
            </li>
            <li>
              <Check />
              <span>Full growth Timeline &amp; private Journal</span>
            </li>
            <li>
              <Check />
              <span>Priority identification &amp; early access to new features</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
