"use client";

import { authClient } from "@/lib/auth-client";
import { useLastKnownLocation } from "@/hooks/use-last-known-location";

export function LastKnownLocationUpdater() {
	const { data: session } = authClient.useSession();
	useLastKnownLocation(session?.user?.id);
	return null;
}
