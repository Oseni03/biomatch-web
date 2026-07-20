"use client";

import { DonorDirectory } from "@/components/hospital/donor-directory";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default function HospitalDirectoryPage() {
	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Proactive Donor Directory"
				subtitle="Browse and reach out to registered donors before an emergency hits"
			/>
			<DonorDirectory />
		</div>
	);
}
