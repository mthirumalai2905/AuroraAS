import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { categoryImage, insights } from "@/lib/data/site";
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
        {insights.slice(0, 3).map((post) => (
          <StaggerItem key={post.slug}>
            <Link href={`/insights/${post.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-lilac-3">
                <Image
                  src={categoryImage[post.category]}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] ease-apple group-hover:scale-[1.05]"
                />
                <span className="eyebrow absolute top-4 left-4 rounded-full bg-white/80 px-3 py-1.5 text-[9px] backdrop-blur-md">
                  {post.category}
                </span>
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
