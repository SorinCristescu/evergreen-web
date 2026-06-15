import { GardenBackground } from "@/components/garden/GardenBackground";
import { ScrollEngine } from "@/components/ScrollEngine";
import { ProgressBar } from "@/components/ProgressBar";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
// SectionNav now lives inside Header
import { Loop } from "@/components/Loop";
import { Walk } from "@/components/Walk";
import { Pricing } from "@/components/Pricing";
import { Download } from "@/components/Download";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* fixed WebGL garden background (client-only) */}
      <GardenBackground />
      <div className="vignette" aria-hidden="true" />
      <ProgressBar />
      <div className="scrollcue">
        Scroll to walk inside
        <div className="line" />
      </div>

      {/* drives the shared scroll store */}
      <ScrollEngine />

      <Header />

      <main id="top">
        <Hero />
        <Loop />
        <Walk />
        <Pricing />
        <Download />
      </main>

      <Footer />
    </>
  );
}
