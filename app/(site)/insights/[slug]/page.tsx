import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";
import { InsightCover } from "@/components/insights/InsightCover";
import { getInsight, insights } from "@/lib/data/site";
import { fmt } from "@/lib/format";

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: getInsight(slug)?.title ?? "Insight" };
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getInsight(slug);
  if (!article) notFound();
  const related = insights.filter((i) => i.slug !== slug).slice(0, 2);

  return (
    <article>
      <div className="mx-auto max-w-3xl px-6 pt-36 md:pt-44">
        <Reveal>
          <Link href="/insights" className="eyebrow inline-flex items-center gap-2 text-[10px] text-ink-2 hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> All insights
          </Link>
          <div className="eyebrow mt-10 text-[10px] text-muted">{article.category}</div>
        </Reveal>
        <AnimatedText text={article.title} className="display mt-5 text-[44px] leading-[1.04] md:text-[68px]" />
        <Reveal delay={0.3}>
          <div className="mt-8 flex items-center gap-4">
            <span className="display grid h-11 w-11 place-items-center rounded-full bg-lilac-3 text-[17px] italic text-plum">
              {article.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div className="text-[14px]">
              <div className="font-medium">{article.author}</div>
              <div className="text-muted">
                {fmt.date(article.date)} · {article.readTime} min read
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.35} className="mx-auto mt-12 max-w-5xl px-6">
        <div className="relative aspect-[16/8] overflow-hidden rounded-[24px]">
          <InsightCover article={article} index={insights.indexOf(article)} size="banner" className="h-full w-full" />
        </div>
      </Reveal>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <Reveal>
          <p className="display mt-14 text-[28px] leading-[1.35]">{article.excerpt}</p>
          <div className="mt-8 space-y-6 text-[18px] leading-[1.8] text-ink-2">
            {article.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="mt-12 border-t border-line pt-6 text-[12.5px] leading-relaxed text-muted">
            This article is for information purposes only and does not constitute investment advice or an offer to buy or sell any security.
          </p>
        </Reveal>

        <div className="mt-20">
          <div className="eyebrow text-[10px] text-muted">Keep reading</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/insights/${r.slug}`} className="group rounded-[22px] bg-white p-6 transition-transform duration-500 ease-apple hover:-translate-y-1">
                <div className="eyebrow text-[9.5px] text-muted">{r.category}</div>
                <div className="display mt-3 text-[24px] leading-[1.15]">{r.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
