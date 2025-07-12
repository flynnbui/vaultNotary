import { NextResponse, NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
    // Always let Auth0 middleware handle auth routes first
    const authRes = await auth0.middleware(request);

    // authentication routes — let the middleware handle it completely
    if (request.nextUrl.pathname.startsWith("/auth")) {
        return authRes;
    }

    // public routes — no need to check for session
    if (request.nextUrl.pathname === "/") {
        return authRes;
    }

    // For protected routes, check if user has a session
    try {
        const session = await auth0.getSession(request);
        
        // user does not have a session — redirect to login
        if (!session) {
            const { origin } = new URL(request.url);
            return NextResponse.redirect(`${origin}/auth/login`);
        }
    } catch (error) {
        // If there's an error getting session, redirect to login
        const { origin } = new URL(request.url);
        return NextResponse.redirect(`${origin}/auth/login`);
    }

    return authRes;
}

export const config = {
    matcher: [
        // Handle all auth routes
        '/auth/:path*',
        // Protect document management routes and customers
        '/documents/manage/:path*',
        '/customers/:path*',
    ],
};