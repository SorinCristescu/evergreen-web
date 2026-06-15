import type { IconName } from "./icons";

/**
 * The Walk scrollytelling steps — one guided pass through Evergreen's customer
 * journey. Screens are the real product captures in `public/evergreen-screens/`,
 * ordered exactly as the journey is described in `docs/customer-journey.md` and
 * `docs/customer-journey-diagram.html`: Auth → Onboarding → Identify → Today →
 * Garden → Plant detail → Dr. Plant → Community → Profile. Phases with no
 * captured screen (Discovery, Welcome, Paywall) are skipped.
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

const S = "/evergreen-screens";

export const STEPS: Step[] = [
  // ── Phase 1 · First Launch & Authentication ──────────────────────────────
  {
    img: `${S}/splash-screen.png`,
    name: "Splash",
    title: "A breath of green",
    lead: "The Evergreen logo blooms on a dark canvas before anything is asked of you.",
    factL: { icon: "lock", h: "No session yet", t: "We check silently, then route you onward." },
    factR: { icon: "leaf", h: "One brand beat", t: "A calm open, then straight into setup." },
  },
  {
    img: `${S}/auth-screens/sign-in-with-email-1.png`,
    name: "Sign in",
    title: "No password to invent",
    lead: "Continue with Google, Apple, or a one-tap email magic link.",
    factL: { icon: "lock", h: "Three paths", t: "Google, Apple, or an email link — no forms." },
    factR: { icon: "spark", h: "Seconds in", t: "Clerk hands you a session and you're through." },
  },

  // ── Phase 2 · Location Onboarding ────────────────────────────────────────
  {
    img: `${S}/onboarding-screens/onboarding-step-1.png`,
    name: "Onboarding · Location",
    title: "Name this place",
    lead: "Home, Studio, a holiday house — your top-level garden.",
    factL: { icon: "pin", h: "Per-Location care", t: "Each place is tuned to its own climate and light." },
    factR: { icon: "leaf", h: "Add more later", t: "You can grow into more Locations anytime." },
  },
  {
    img: `${S}/onboarding-screens/onboarding-step-3.png`,
    name: "Onboarding · Level",
    title: "How green is your thumb?",
    lead: "Beginner to expert — we set the depth of guidance.",
    factL: { icon: "leaf", h: "Per place", t: "Expert at home, beginner at the cabin is fine." },
    factR: { icon: "heal", h: "Adjustable", t: "Change it anytime as you grow." },
  },
  {
    img: `${S}/onboarding-screens/onboarding-step-5.png`,
    name: "Onboarding · First Space",
    title: "Where will it live?",
    lead: "Pick a Place, then the Space — the room or area.",
    factL: { icon: "grid", h: "Spaces", t: "Living Room, Balcony, Greenhouse — your real rooms." },
    factR: { icon: "sun", h: "Light-aware", t: "Light and humidity tune the care plan." },
  },
  {
    img: `${S}/onboarding-screens/onboarding-step-6.png`,
    name: "Onboarding · First Plant",
    title: "Add your first plant",
    lead: "Snap a photo to identify it, or add it by hand.",
    factL: { icon: "cam", h: "Camera-first", t: "Recommended — we name it and build a plan." },
    factR: { icon: "target", h: "Or skip", t: "Land on Welcome and add one later." },
  },

  // ── Phase 3 · Plant Identification & Add to Garden ───────────────────────
  {
    img: `${S}/add-first-plant-screens/add-first-plant-photo-identify.png`,
    name: "Identify · Capture",
    title: "Point. Frame. Shoot.",
    lead: "A live viewfinder — your photo is never discarded while the model runs.",
    factL: { icon: "cam", h: "1–3 seconds", t: "Plant.id reads the photo and ranks the matches." },
    factR: { icon: "target", h: "Honest ID", t: "We always show how sure an identification is." },
  },
  {
    img: `${S}/add-first-plant-screens/add-first-plant-identify.png`,
    name: "Identify · Result",
    title: "Named, with a care preview",
    lead: "Common name, scientific name, confidence — then Add to my garden.",
    factL: { icon: "leaf", h: "Care preview", t: "See the plan before it joins your garden." },
    factR: { icon: "spark", h: "AI care plan", t: "Watering, light and feeding, calibrated to you." },
  },

  // ── Phase 5 · Daily Care Ritual ──────────────────────────────────────────
  {
    img: `${S}/today-screen.png`,
    name: "Today",
    title: "A two-minute pass",
    lead: "Every plant that needs you today, grouped by urgency.",
    factL: { icon: "list", h: "Grouped", t: "Overdue, Due today, Coming up — sorted for you." },
    factR: { icon: "drop", h: "Gentle streak", t: "A streak kept with kindness, not guilt." },
  },
  {
    img: `${S}/weather-screen.png`,
    name: "Weather",
    title: "Care that reads the sky",
    lead: "A local forecast for every Location, refreshed daily.",
    factL: { icon: "sun", h: "At a glance", t: "Humidity, wind, rain and UV per place." },
    factR: { icon: "spark", h: "Advisory only", t: "“Rain today — skip outdoor watering?” You decide." },
  },

  // ── Phase 6 · Garden Exploration ─────────────────────────────────────────
  {
    img: `${S}/garden-screen.png`,
    name: "Garden",
    title: "Your whole collection",
    lead: "Plants across Places and Spaces, beautifully sorted.",
    factL: { icon: "grid", h: "By Space", t: "Filter Indoor, Outdoor, Greenhouse; grouped by room." },
    factR: { icon: "leaf", h: "Fast at scale", t: "Smooth from five plants to five hundred." },
  },

  // ── Phase 7 · Plant Detail & Ongoing Care ────────────────────────────────
  {
    img: `${S}/plant-details-screens/plant-details-care.png`,
    name: "Plant · Care",
    title: "The next right action",
    lead: "Every CareTask for this plant, one tap from done.",
    factL: { icon: "heal", h: "Four tabs", t: "Care, About, Timeline, and your private Journal." },
    factR: { icon: "drop", h: "Sticky actions", t: "The next right action is always one tap away." },
  },
  {
    img: `${S}/plant-details-screens/plant-details-about.png`,
    name: "Plant · About",
    title: "Know its nature",
    lead: "Ideal light, watering, soil and toxicity at a glance.",
    factL: { icon: "leaf", h: "Species profile", t: "Linked straight to the Encyclopedia page." },
    factR: { icon: "sun", h: "Light & soil", t: "What it wants, in plain language." },
  },
  {
    img: `${S}/plant-details-screens/plant-details-timeline.png`,
    name: "Plant · Timeline",
    title: "A living history",
    lead: "Photos, completed tasks, IDs and treatments in order.",
    factL: { icon: "list", h: "Every event", t: "Watch this plant change over the seasons." },
    factR: { icon: "spark", h: "Auto-built", t: "Nothing to log — it assembles itself." },
  },
  {
    img: `${S}/plant-details-screens/plant-details-journal.png`,
    name: "Plant · Journal",
    title: "Your private notes",
    lead: "“Repotted into a 15cm terracotta pot today.”",
    factL: { icon: "leaf", h: "Free-text", t: "Dated notes, kept just for you." },
    factR: { icon: "heal", h: "Context kept", t: "Remember what worked, and what didn't." },
  },

  // ── Phase 8 · Dr. Plant (Diagnosis) ──────────────────────────────────────
  {
    img: `${S}/plant-details-screens/plant-details-dr-plant-diagnose.png`,
    name: "Dr. Plant",
    title: "Know what's wrong",
    lead: "Photograph a sick leaf — get a diagnosis and a plan.",
    factL: { icon: "heal", h: "Plain language", t: "The likely problem, and what to do next." },
    factR: { icon: "target", h: "Confidence shown", t: "Unsure? Ask the community for a second opinion." },
  },
  {
    img: `${S}/plant-details-screens/plant-details-care-treatment.png`,
    name: "Treatment",
    title: "A plan with a countdown",
    lead: "Save a diagnosis and a Treatment banner tracks every step.",
    factL: { icon: "heal", h: "Protocol steps", t: "“Apply neem oil every 5 days for 3 weeks.”" },
    factR: { icon: "bell", h: "Reminded", t: "Each step becomes a timed CareTask." },
  },

  // ── Phase 9 · Community & Social ─────────────────────────────────────────
  {
    img: `${S}/community-screens/community-feed.png`,
    name: "Community",
    title: "A botanist in your pocket",
    lead: "Share first blooms, swap cuttings, ask experts.",
    factL: { icon: "people", h: "Feed · Swap", t: "Discover gardeners or follow the ones you trust." },
    factR: { icon: "leaf", h: "Kept safe", t: "Every photo is moderated before it lands." },
  },
  {
    img: `${S}/community-screens/community-challenges.png`,
    name: "Challenges",
    title: "Grow with the season",
    lead: "Propagation, repotting, dormancy — challenges tied to the calendar.",
    factL: { icon: "spark", h: "Seasonal", t: "A reason to open the app even when caught up." },
    factR: { icon: "people", h: "Together", t: "Join in and share your entry." },
  },
  {
    img: `${S}/community-screens/community-add-post.png`,
    name: "Create post",
    title: "Show your garden",
    lead: "Pick photos, add a caption, tag a Species or a plant.",
    factL: { icon: "cam", h: "One handle", t: "Claim your @handle on your first post." },
    factR: { icon: "leaf", h: "Moderated", t: "Borderline content is flagged before it spreads." },
  },

  // ── Phase 10 · Profile, Settings & Growth ────────────────────────────────
  {
    img: `${S}/profile-screens/profile-1.png`,
    name: "Profile",
    title: "How you're doing",
    lead: "Total plants, your streak, tasks completed this month.",
    factL: { icon: "target", h: "Your hub", t: "Locations, Memorial, Wishlist and ID history." },
    factR: { icon: "leaf", h: "Reflective", t: "See your year of growth at a glance." },
  },
  {
    img: `${S}/profile-screens/profile-account.png`,
    name: "Settings",
    title: "In control",
    lead: "Account, notifications, permissions and appearance.",
    factL: { icon: "bell", h: "Your cadence", t: "One daily digest, or tune it task by task." },
    factR: { icon: "lock", h: "Your data", t: "Export anytime; delete with a 30-day grace." },
  },
];
