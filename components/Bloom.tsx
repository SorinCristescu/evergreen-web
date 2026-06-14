/**
 * The evergreen bloom mark — 8 rotated petals + center.
 * Reused in the header wordmark, hero, and footer (ported verbatim from the export).
 */
export function Bloom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-60 -60 120 120" aria-hidden="true">
      <ellipse cx="0" cy="-18" rx="9" ry="16" fill="#2D6A4F" opacity="0.95" />
      <ellipse cx="0" cy="-18" rx="9" ry="16" fill="#2D6A4F" opacity="0.88" transform="rotate(45)" />
      <ellipse cx="0" cy="-18" rx="9" ry="16" fill="#2D6A4F" opacity="0.78" transform="rotate(90)" />
      <ellipse cx="0" cy="-18" rx="9" ry="16" fill="#2D6A4F" opacity="0.66" transform="rotate(135)" />
      <ellipse cx="0" cy="-18" rx="9" ry="16" fill="#52B788" opacity="0.56" transform="rotate(180)" />
      <ellipse cx="0" cy="-18" rx="9" ry="16" fill="#52B788" opacity="0.46" transform="rotate(225)" />
      <ellipse cx="0" cy="-18" rx="9" ry="16" fill="#95D5B2" opacity="0.36" transform="rotate(270)" />
      <ellipse cx="0" cy="-18" rx="9" ry="16" fill="#95D5B2" opacity="0.26" transform="rotate(315)" />
      <circle cx="0" cy="0" r="7" fill="#1B4332" />
    </svg>
  );
}

/** The "evergreen" wordmark (bloom + text), used in header and footer. */
export function Wordmark({
  href = "#top",
  markClassName = "mark",
  ...rest
}: {
  href?: string;
  markClassName?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className="wordmark" href={href} {...rest}>
      <Bloom className={markClassName} />
      <span>
        <b>ever</b>
        <span className="g">green</span>
      </span>
    </a>
  );
}
