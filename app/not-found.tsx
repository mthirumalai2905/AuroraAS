import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="h-dvh p-2 md:p-3">
      <div className="grain relative grid h-full place-items-center overflow-hidden rounded-[24px] px-6 text-center text-white md:rounded-[32px]">
        <Image src="/images/hero-sky.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-night/35" />
        <div className="relative">
          <span className="eyebrow text-white/70">Error 404</span>
          <h1 className="display mt-5 text-[64px] leading-none md:text-[112px]">
            <span className="italic">Lost</span> in the clouds.
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-white/75">The page you are looking for does not exist or has moved.</p>
          <div className="mt-9">
            <Button href="/" variant="light">Back to home</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
