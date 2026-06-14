"use client";

import { useEffect, useRef } from "react";
import { STEPS } from "@/lib/steps";
import { Icon } from "@/lib/icons";
import { useWalkStep } from "@/lib/scrollStore";
import { useReveal } from "@/lib/useReveal";

const N = STEPS.length;
const pad = (n: number) => (n < 10 ? "0" : "") + n;

export function Walk() {
  const ref = useRef<HTMLElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const step = useWalkStep();
  useReveal(ref);

  // pulse the device halo on each step change (ports setStep's pulse)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !deviceRef.current) return;
    const el = deviceRef.current;
    el.classList.add("pulse");
    const t = window.setTimeout(() => el.classList.remove("pulse"), 520);
    return () => window.clearTimeout(t);
  }, [step]);

  return (
    <section id="walk" ref={ref} data-od-id="walk" data-chapter>
      <div className="walk-intro">
        <p className="eyebrow reveal" style={{ justifyContent: "center" }}>
          Walk the garden · keep scrolling
        </p>
        <h2 className="reveal">Every screen, as you stroll.</h2>
      </div>

      <div className="stage" aria-label="Guided app walkthrough">
        <div className="cap-col left" id="capLeft">
          {STEPS.map((s, i) => (
            <div className={`capset${i === step ? " on" : ""}`} key={`l-${i}`}>
              <span className="tagp">
                <span className="dot" />
                {pad(i + 1)} / {pad(N)}
              </span>
              <h3>{s.title}</h3>
              <p>{s.lead}</p>
              <div className="fact">
                <Icon name={s.factL.icon} />
                <span>
                  <b>{s.factL.h}.</b> {s.factL.t}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="device" id="device" ref={deviceRef}>
          <span className="halo2" />
          <div className="screens" id="screens">
            {STEPS.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`img-${i}`}
                src={encodeURI(s.img)}
                alt={`${s.name} screen`}
                loading={i < 2 ? "eager" : "lazy"}
                className={i === step ? "on" : undefined}
              />
            ))}
          </div>
          <span className="rail l" />
          <span className="rail r" />
          <span className="key mute" />
          <span className="key vu" />
          <span className="key vd" />
          <span className="key pwr" />
          <span className="glare" />
        </div>

        <div className="cap-col right" id="capRight">
          {STEPS.map((s, i) => (
            <div className={`capset${i === step ? " on" : ""}`} key={`r-${i}`}>
              <span className="knum">{s.name}</span>
              <div className="fact">
                <Icon name={s.factR.icon} />
                <span>
                  <b>{s.factR.h}.</b> {s.factR.t}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="step-meta">
          <span id="stepName">
            {pad(step + 1)} · {STEPS[step].name}
          </span>
          <span className="track">
            <span className="fill" id="stepFill" style={{ width: `${(((step + 1) / N) * 100).toFixed(1)}%` }} />
          </span>
        </div>
      </div>
    </section>
  );
}
