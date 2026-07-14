"use client";

import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import HospitalDashboard from "@/components/hospital/hospital-dashboard";

export default function HospitalDashboardPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();

	if (sessionLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">
				Sign in to view the hospital dashboard
			</p>
		);
	}

	return <HospitalDashboard hospitalUserId={session.user.id} />;
}
