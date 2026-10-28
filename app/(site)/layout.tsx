import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { SmoothScroll } from "@/components/site/SmoothScroll";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
