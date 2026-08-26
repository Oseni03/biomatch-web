import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

// Cached per request so multiple Server Components (layout + page) resolving
// the session don't each pay for a separate lookup.
export const getServerSession = cache(async () => {
	return auth.api.getSession({ headers: await headers() });
});
