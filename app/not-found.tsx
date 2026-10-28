import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="h-dvh p-2 md:p-3">
      <div
        className="grain relative grid h-full place-items-center overflow-hidden rounded-[24px] bg-[#141122] px-6 text-center text-white md:rounded-[32px]"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 25%, rgba(199,189,242,0.38), transparent 70%), radial-gradient(55% 45% at 75% 75%, rgba(191,227,245,0.28), transparent 70%)",
        }}
      >
        <div className="relative">
          <span className="eyebrow text-white/70">Error 404</span>
          <h1 className="display mt-5 text-[64px] leading-none md:text-[112px]">
            <span className="italic">Off</span> the map.
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
