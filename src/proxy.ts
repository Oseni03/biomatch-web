import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasSatisfiedConsents } from "@/servers/consent";
import { getSessionRole } from "@/servers/user";

const CONSENT_GATED_PREFIXES = ["/donor", "/hospital", "/admin", "/merchant", "/auth/onboarding"];

function needsConsentGate(pathname: string): boolean {
	return CONSENT_GATED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

export async function proxy(request: NextRequest) {
	const { nextUrl } = request;
	const pathname = nextUrl.pathname;

	const authOnlyPublicRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/auth/accept-invitation"];
	const publicPrefixes = ["/api/auth", "/api/health"];

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

		if (process.env.NODE_ENV === "production" && session.user.emailVerified === false) {
			const loginUrl = new URL("/auth/login", request.url);
			loginUrl.searchParams.set("email", session.user.email ?? "");
			loginUrl.searchParams.set("verify-required", "1");
			return NextResponse.redirect(loginUrl);
		}

		if (pathname.startsWith("/admin")) {
			const role = await getSessionRole(session.user.id);
			if (role !== "admin") {
				return NextResponse.redirect(new URL("/donor", request.url));
			}
		}

		if (needsConsentGate(pathname)) {
			const satisfied = await hasSatisfiedConsents(session.user.id);
			if (!satisfied) {
				const consentUrl = new URL("/auth/consent", request.url);
				consentUrl.searchParams.set("next", pathname + nextUrl.search);
				return NextResponse.redirect(consentUrl);
			}
		}

		return NextResponse.next();
	} catch {
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
		"/merchant/:path*",
	],
};
