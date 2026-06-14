import type { IconName } from "./icons";

/**
 * The Walk scrollytelling steps (ported verbatim from the export's `STEPS`).
 * `img` is mapped from the export's prefixed asset names to the real files in
 * `public/screenshots/` by matching the trailing timestamp. Paths contain
 * spaces — `encodeURI()` them at render time.
 */
export type Fact = { icon: IconName; h: string; t: string };

export type Step = {
  img: string;
  name: string;
  title: string;
  lead: string;
  factL: Fact;
  factR: Fact;
};

const SHOTS = "/screenshots";

export const STEPS: Step[] = [
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.13.36.png`,
    name: "Onboarding · Location",
    title: "Name this place",
    lead: "Start with where you grow — Home, Studio, a holiday house.",
    factL: { icon: "pin", h: "Per-Location care", t: "Each place is tuned to its own climate and light." },
    factR: { icon: "leaf", h: "Add more later", t: "You can grow into more Locations anytime." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.13.52.png`,
    name: "Onboarding · Climate",
    title: "Where do you garden?",
    lead: "Your city sets light hours, humidity, and season.",
    factL: { icon: "sun", h: "Local forecast", t: "We refresh the weather each morning." },
    factR: { icon: "pin", h: "Privacy-safe", t: "Use your location, or just type a city." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.14.14.png`,
    name: "Onboarding · Level",
    title: "How green is your thumb?",
    lead: "Beginner to expert — we set the depth of guidance.",
    factL: { icon: "leaf", h: "Per place", t: "Expert at home, beginner at the cabin is fine." },
    factR: { icon: "heal", h: "Adjustable", t: "Change it anytime as you grow." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.14.30.png`,
    name: "Onboarding · Goals",
    title: "What are you hoping for?",
    lead: "Keep them alive, help them thrive, learn, or share.",
    factL: { icon: "target", h: "Tailored nudges", t: "Goals shape what evergreen surfaces first." },
    factR: { icon: "leaf", h: "Pick a few", t: "Mix and match — nothing is locked in." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.14.45.png`,
    name: "Onboarding · First Space",
    title: "Where will it live?",
    lead: "Pick a Place, then the Space — the room or area.",
    factL: { icon: "grid", h: "Spaces", t: "Living Room, Balcony, Bedroom — your real rooms." },
    factR: { icon: "sun", h: "Light-aware", t: "Light and humidity tune the care plan." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.15.03.png`,
    name: "Onboarding · First Plant",
    title: "Add your first plant",
    lead: "Snap a photo to identify it, or add it by hand.",
    factL: { icon: "cam", h: "Camera-first", t: "Recommended — we name it and build a plan." },
    factR: { icon: "target", h: "Honest ID", t: "We always show how sure an identification is." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.09.37.png`,
    name: "Identify",
    title: "Point. Know. Plant it.",
    lead: "Center the plant and evergreen names it instantly.",
    factL: { icon: "cam", h: "96% confident", t: "Monstera deliciosa — never a confident guess." },
    factR: { icon: "leaf", h: "Care preview", t: "See the plan before it joins your garden." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.08.26.png`,
    name: "Today",
    title: "A two-minute pass",
    lead: "Good evening, Sorin. Every plant that needs you, by urgency.",
    factL: { icon: "list", h: "Grouped", t: "Overdue, Due today, Coming up — 30 tasks, sorted." },
    factR: { icon: "drop", h: "Gentle streak", t: "A 12-day streak, kept with kindness not guilt." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.11.39.png`,
    name: "Weather",
    title: "Care that reads the sky",
    lead: "A local forecast for every Location, refreshed daily.",
    factL: { icon: "sun", h: "At a glance", t: "Humidity, wind, rain and UV per place." },
    factR: { icon: "spark", h: "Advisory only", t: "“High UV — shade midday.” It never auto-skips." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.10.27.png`,
    name: "Garden",
    title: "Your whole collection",
    lead: "14 plants across Places and Spaces, beautifully sorted.",
    factL: { icon: "grid", h: "By Space", t: "Filter Indoor, Outdoor, Greenhouse; grouped by room." },
    factR: { icon: "leaf", h: "Fast at scale", t: "Smooth from five plants to five hundred." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.12.00.png`,
    name: "Plant detail",
    title: "Everything about Mara",
    lead: "A fiddle-leaf fig under treatment — step 3 of 5.",
    factL: { icon: "heal", h: "Four tabs", t: "Care, About, Timeline, and your private Journal." },
    factR: { icon: "drop", h: "Sticky actions", t: "The next right action is always one tap away." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.10.59.png`,
    name: "Community",
    title: "A botanist in your pocket",
    lead: "Share first blooms, swap cuttings, ask experts.",
    factL: { icon: "people", h: "Feed · Swap", t: "Discover gardeners or follow the ones you trust." },
    factR: { icon: "leaf", h: "Kept safe", t: "Every photo is moderated before it lands." },
  },
  {
    img: `${SHOTS}/Screenshot 2026-06-14 at 20.15.59.png`,
    name: "Activity",
    title: "Nudged at the right moment",
    lead: "Care, community, and system alerts in one calm stream.",
    factL: { icon: "bell", h: "Care first", t: "“Mara needs water · overdue by 1 day.”" },
    factR: { icon: "people", h: "Stay in touch", t: "@leaf.lydia replied to your swap — “See you Saturday!”" },
  },
];
