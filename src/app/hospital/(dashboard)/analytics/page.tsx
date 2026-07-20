"use client";

import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AnalyticsDashboard } from "@/components/hospital/analytics-dashboard";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default function HospitalAnalyticsPage() {
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
				title="Analytics & Reports"
				subtitle="Response times, fulfillment rates, and coverage gaps across your emergency requests"
			/>
			<AnalyticsDashboard hospitalId={session.user.id} />
		</div>
	);
}
