"use client";

import { RefreshCw } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useInventory } from "@/hooks/use-inventory";
import { useEligibleDonors } from "@/hooks/use-eligible-donors";
import type { EligibleDonor } from "@/components/donor/eligible-donors-list";
import { BloodSearchCards } from "@/components/hospital/blood-search-cards";
import { DonorCards } from "@/components/hospital/donor-cards";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

const LOADING_GROUPS = Array.from({ length: 8 });

export default function HospitalInventoryPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();

	const {
		data: banks,
		isLoading: banksLoading,
		dataUpdatedAt,
	} = useInventory();

	const { data: donorsData } = useEligibleDonors({ eligibleOnly: true });

	const eligibleDonors: EligibleDonor[] = (donorsData?.donors ?? []).map(
		(d) => ({
			id: d.id,
			name: d.name,
			bloodGroup: d.bloodGroup,
			location: d.location ?? null,
			lastDonationDate: d.lastDonationDate?.toISOString() ?? null,
		}),
	);

	const loading = sessionLoading || banksLoading;

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					{LOADING_GROUPS.slice(0, 4).map((_, i) => (
						<div
							key={i}
							className="h-24 animate-pulse rounded-xl bg-muted"
						/>
					))}
				</div>
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{LOADING_GROUPS.map((_, i) => (
						<div
							key={i}
							className="h-56 animate-pulse rounded-xl bg-muted"
						/>
					))}
				</div>
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p>Sign in to view inventory</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Live Inventory Grid"
				subtitle="Find blood inventory across all BioMatch partner banks"
				action={
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<RefreshCw className="h-3.5 w-3.5" />
						{dataUpdatedAt
							? `Synced ${new Date(dataUpdatedAt).toLocaleTimeString()}`
							: "Syncing..."}
					</div>
				}
			/>

			<BloodSearchCards
				banks={(banks ?? []).map((b) => ({
					...b,
					inventory: b.inventory as Record<string, number>,
				}))}
			/>

			<DonorCards donors={eligibleDonors} />
		</div>
	);
}
