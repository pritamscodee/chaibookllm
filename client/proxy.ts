import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { authRoutes, isProtectedRoute } from "@/features/auth/lib/auth-routes";

// Optimistic check only: look for the session cookie instead of calling the
// auth server on every navigation. Pages still verify the session for real via
// requireAuth() / unauth(), so a stale cookie simply ends up on /sign-in.
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isProtectedRoute(pathname) && !getSessionCookie(request)) {
        const loginUrl = new URL(authRoutes.login, request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/workspace/:path*", "/settings/:path*"],
};
