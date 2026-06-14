"use client";

import dynamic from "next/dynamic";

// ssr:false must live inside a Client Component in Next 16. The garden is
// WebGL-only, so there's nothing to render server-side.
const GardenCanvas = dynamic(() => import("./GardenCanvas"), { ssr: false });

export function GardenBackground() {
  return <GardenCanvas />;
}
