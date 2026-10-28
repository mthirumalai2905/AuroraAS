import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifyCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const user = email && password ? verifyCredentials(email, password) : null;

  if (!user) {
    return NextResponse.json({ error: "The email or password you entered is incorrect." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, name: user.name });
  res.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
