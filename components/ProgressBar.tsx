"use client";

import { useScrollP } from "@/lib/scrollStore";

export function ProgressBar() {
  const p = useScrollP();
  return <div id="progress" aria-hidden="true" style={{ width: `${(p * 100).toFixed(2)}%` }} />;
}
