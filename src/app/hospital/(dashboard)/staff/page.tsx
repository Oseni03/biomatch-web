"use client";

import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StaffAccounts } from "@/components/hospital/staff-accounts";

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

	return <StaffAccounts hospitalId={session.user.id} />;
}
