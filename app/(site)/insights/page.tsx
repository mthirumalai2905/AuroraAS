import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { InsightsList } from "@/components/insights/InsightsList";

export const metadata: Metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <>
      <PageHeader
        image="/images/hero-sky.jpg"
        eyebrow="Insights"
        title="Research, outlooks and ideas."
        italicWords={["ideas."]}
        description="Perspectives from our investment, operating and sustainability teams on the forces reshaping markets."
      />
      <InsightsList />
    </>
  );
}
