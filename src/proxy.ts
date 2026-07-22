import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
	const { nextUrl } = request;
	const pathname = nextUrl.pathname;

	const authOnlyPublicRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password"];
	const publicPrefixes = ["/api/auth"];

	if (
		authOnlyPublicRoutes.includes(pathname) ||
		publicPrefixes.some((prefix) => pathname.startsWith(prefix))
	) {
		return NextResponse.next();
	}

	if (pathname === "/") {
		return NextResponse.next();
	}

	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

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
			return NextResponse.redirect(new URL("/auth/login", request.url));
		}

		if (pathname.startsWith("/admin") && userRole !== "admin") {
			return NextResponse.redirect(new URL(`/${userRole}`, request.url));
		}

		if (pathname.startsWith("/hospital") && userRole !== "hospital") {
			return NextResponse.redirect(new URL(`/${userRole}`, request.url));
		}

		if (pathname.startsWith("/donor") && userRole !== "donor") {
			return NextResponse.redirect(new URL(`/${userRole}`, request.url));
		}

		return NextResponse.next();
	} catch (error) {
		if (pathname === "/") {
			return NextResponse.next();
		}
		const loginUrl = new URL("/auth/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}
}

export const config = {
	matcher: [
		"/",
		"/auth/:path*",
		"/donor/:path*",
		"/admin/:path*",
		"/hospital/:path*",
	],
};
