import { NextRequest, NextResponse } from "next/server";
import { managerAuthCookieName, managerAuthCookieValue } from "@/lib/manager-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/manager/login";
  const isAuthorized = request.cookies.get(managerAuthCookieName)?.value === managerAuthCookieValue;

  if (isLoginPage && isAuthorized) {
    return NextResponse.redirect(new URL("/manager", request.url));
  }

  if (!isLoginPage && !isAuthorized) {
    return NextResponse.redirect(new URL("/manager/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/manager/:path*"],
};
