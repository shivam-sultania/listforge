import { NextResponse, type NextRequest } from "next/server";

// Must match SESSION_COOKIE in lib/session.ts.
const SESSION_COOKIE = "session";

// Quick gate only: checks the cookie exists. Pages and actions still verify it against the DB.
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/lists/:path*", "/dev/:path*"],
};
