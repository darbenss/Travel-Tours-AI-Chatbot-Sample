
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustPartners } from "@/components/landing/trust-partners";
import { CuratedCollections } from "@/components/landing/curated-collections";
import { SeasonalSpotlight } from "@/components/landing/seasonal-spotlight";
import { UprevDifference } from "@/components/landing/uprev-difference";
import { TravelerStories } from "@/components/landing/traveler-stories";
import { UprevJournal } from "@/components/landing/uprev-journal";
import { Footer } from "@/components/landing/footer";
import { FloatingActionButton } from "@/components/landing/floating-action-button";

export default function Home() {
  return (
    <main className="min-h-screen relative font-sans">
      <Navbar />
      <Hero />
      <TrustPartners />
      <CuratedCollections />
      <SeasonalSpotlight />
      <UprevDifference />
      <TravelerStories />
      <UprevJournal />
      <Footer />
      <FloatingActionButton />
    </main>
  );
}
