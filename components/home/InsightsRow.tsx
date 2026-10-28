import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { InsightCover } from "@/components/insights/InsightCover";
import { insights } from "@/lib/data/site";
import { fmt } from "@/lib/format";

export function InsightsRow() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32">
      <SectionIntro
        eyebrow="Insights"
        title="Thinking in decades."
        italicWords={["decades."]}
        description="Research and perspectives from our investment, operating and sustainability teams."
        action={<Button href="/insights" variant="outline" size="sm">All insights</Button>}
      />
      <Stagger className="mt-14 grid gap-x-4 gap-y-10 md:grid-cols-3">
        {insights.slice(0, 3).map((post, i) => (
          <StaggerItem key={post.slug}>
            <Link href={`/insights/${post.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                <InsightCover article={post} index={i} className="h-full w-full" />
              </div>
              <div className="eyebrow mt-5 text-[10px] text-muted">
                {fmt.date(post.date)} · {post.readTime} min read
              </div>
              <h3 className="display mt-3 text-[26px] leading-[1.12] transition-colors group-hover:text-ink-2">{post.title}</h3>
              <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-ink-2">{post.excerpt}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
