/**
 * Inline stroke-icon set used by the Walk captions (ported verbatim from the
 * export's `I` map + `SVG()` wrapper).
 */
export const ICON_PATHS = {
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  pin: '<path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13C4 8 9 4 20 4c0 11-4 16-9 16Z"/><path d="M4 20c2-5 6-8 11-9"/>',
  cam: '<path d="M14.5 4h-5L8 6H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-4l-1.5-2Z"/><circle cx="12" cy="13" r="3.5"/>',
  list: '<path d="M4 6h10M4 12h16M4 18h7"/>',
  drop: '<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.7-2.3 1.5-3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  heal: '<path d="M12 2v20M5 9l7-7 7 7"/>',
  people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 18a4 4 0 0 1 6 0"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  target: '<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>',
  spark: '<path d="M12 3v6M9 6l3-3 3 3"/><circle cx="12" cy="15" r="6"/>',
} as const;

export type IconName = keyof typeof ICON_PATHS;

/** Renders a 24×24 stroke icon by name. */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}
