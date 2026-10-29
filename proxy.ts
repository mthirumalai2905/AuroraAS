import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const { userId } = await auth();
  const demoSession = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthed = Boolean(userId || demoSession);

  if (pathname.startsWith("/dashboard") && !isAuthed) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
