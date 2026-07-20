"use client";

import { RefreshCw } from "lucide-react";
import { useInventory } from "@/hooks/use-inventory";
import { useEligibleDonors } from "@/hooks/use-eligible-donors";
import type { EligibleDonor } from "@/components/donor/eligible-donors-list";
import { BloodSearchCards } from "@/components/hospital/blood-search-cards";
import { DonorCards } from "@/components/hospital/donor-cards";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export function HospitalInventoryClient() {
	const { data: banks, dataUpdatedAt } = useInventory();
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
