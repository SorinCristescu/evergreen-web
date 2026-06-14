/** App Store + Google Play download buttons (ported verbatim from the export). */

export function AppStoreButton({ href = "#download" }: { href?: string }) {
  return (
    <a className="store" href={href} aria-label="Download on the App Store">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.4 12.9c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 .9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6 1 0 1.6-1 2.3-2 .7-1 1-2 1-2 0 .1-1.9-.8-1.9-3.4zM14.5 6.3c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.2 1.2-.5.6-.9 1.5-.8 2.3.9.1 1.8-.5 2.2-1.1z" />
      </svg>
      <span className="s">
        <small>Download on the</small>
        <b>App Store</b>
      </span>
    </a>
  );
}

export function GooglePlayButton({ href = "#download" }: { href?: string }) {
  return (
    <a className="store" href={href} aria-label="Get it on Google Play">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.6 2.3c-.2.2-.3.5-.3.9v17.6c0 .4.1.7.3.9l.1.1L13.5 12 3.7 2.2z" fill="#34A853" />
        <path d="M17 15.3l-3.5-3.3 3.5-3.3 4.2 2.4c1.2.7 1.2 1.8 0 2.5L17 15.3z" fill="#FBBC04" />
        <path d="M3.6 21.7c.3.3.8.4 1.4 0l12-6.4-3.5-3.3-9.9 9.7z" fill="#EA4335" />
        <path d="M3.6 2.3l9.9 9.7 3.5-3.3-12-6.4c-.6-.3-1.1-.3-1.4 0z" fill="#4285F4" />
      </svg>
      <span className="s">
        <small>Get it on</small>
        <b>Google Play</b>
      </span>
    </a>
  );
}

/** Both store buttons in the standard `.cta-row` (className lets callers add inline overrides). */
export function StoreButtons({ className = "cta-row" }: { className?: string }) {
  return (
    <div className={className}>
      <AppStoreButton />
      <GooglePlayButton />
    </div>
  );
}
