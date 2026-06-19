import { NextResponse } from "next/server";
import { getManagerPassword, managerAuthCookieName, managerAuthCookieValue } from "@/lib/manager-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  // Change manager password via MANAGER_PASSWORD env variable. Demo fallback: "333".
  if (password !== getManagerPassword()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(managerAuthCookieName, managerAuthCookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
