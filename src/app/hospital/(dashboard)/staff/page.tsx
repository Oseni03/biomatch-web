"use client";

import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StaffAccounts } from "@/components/hospital/staff-accounts";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default function HospitalStaffPage() {
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
				title="Hospital Staff Accounts"
				subtitle="Manage who on your team can respond to emergency requests and manage inventory."
			/>
			<StaffAccounts hospitalId={session.user.id} />
		</div>
	);
}
