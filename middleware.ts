// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const { nextUrl } = request;
	const pathname = nextUrl.pathname;

	// Public routes (adjust paths to match your actual routes)
	const publicRoutes = [
		"/",
		"/sign-in",
		"/sign-up",
		"/auth/login",
		"/auth/signup",
		"/api/auth",
	];

	if (publicRoutes.some((route) => pathname.startsWith(route))) {
		return NextResponse.next();
	}

	// Fetch session from auth API (avoids importing Prisma in Edge Runtime)
	const baseUrl = `${nextUrl.protocol}//${nextUrl.host}`;
	const sessionUrl = `${baseUrl}/api/auth/get-session`;

	const response = await fetch(sessionUrl, {
		headers: {
			cookie: request.headers.get("cookie") || "",
		},
	});
	const session = await response.json();

	console.log("Middleware user session: ", session);

	// No session → redirect to login
	if (!session?.user?.id) {
		const loginUrl = new URL("/auth/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	const userRole = session.user.role as
		| "donor"
		| "hospital"
		| "admin"
		| undefined;

	if (!userRole) {
		// Fallback if role is missing
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	// Role-based protection
	if (pathname.startsWith("/admin") && userRole !== "admin") {
		return NextResponse.redirect(new URL(`/${userRole}`, request.url));
	}

	if (pathname.startsWith("/hospital") && userRole !== "hospital") {
		return NextResponse.redirect(new URL(`/${userRole}`, request.url));
	}

	if (pathname.startsWith("/donor") && userRole !== "donor") {
		return NextResponse.redirect(new URL(`/${userRole}`, request.url));
	}

	// Redirect root & dashboard to role-specific dashboard
	if (pathname === "/" || pathname === "/dashboard") {
		return NextResponse.redirect(new URL(`/${userRole}`, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all routes except static files and API routes that shouldn't be protected
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
