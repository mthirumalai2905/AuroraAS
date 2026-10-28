import { Capabilities } from "@/components/home/Capabilities";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { HomeHero } from "@/components/home/HomeHero";
import { InsightsRow } from "@/components/home/InsightsRow";
import { Intro } from "@/components/home/Intro";
import { Numbers } from "@/components/home/Numbers";
import { Performance } from "@/components/home/Performance";
import { PortalSection } from "@/components/home/PortalSection";
import { PortfolioList } from "@/components/home/PortfolioList";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Intro />
      <Capabilities />
      <Numbers />
      <PortalSection />
      <PortfolioList />
      <Performance />
      <InsightsRow />
      <ClosingCTA />
    </>
  );
}
