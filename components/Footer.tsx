import { Wordmark } from "./Bloom";

export function Footer() {
  return (
    <footer>
      <Wordmark href="#top" />
      <div>The daily home for plant people — Identify · Care · Diagnose · Connect.</div>
      <div className="row">
        <a href="#download">Download</a>
        <a href="#loop">How it works</a>
        <a href="#walk">The walk</a>
        <a href="#download">Privacy</a>
        <a href="#download">Terms</a>
      </div>
      <div style={{ marginTop: 18, opacity: 0.7 }}>Made for plant people · concept showcase</div>
    </footer>
  );
}
