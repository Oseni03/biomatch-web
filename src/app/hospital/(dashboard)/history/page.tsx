"use client";

import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { EmergencyHistory } from "@/components/hospital/emergency-history";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default function HospitalHistoryPage() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) return null;

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Request History"
				subtitle="Review completed, expired, and cancelled emergency requests"
			/>
			<EmergencyHistory hospitalId={session.user.id} />
		</div>
	);
}
