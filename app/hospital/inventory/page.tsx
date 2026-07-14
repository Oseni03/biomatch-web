"use client";

import { AlertTriangle, Droplet, RefreshCw } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useInventory } from "@/hooks/use-inventory";
import { useEligibleDonors } from "@/hooks/use-eligible-donors";
import { EligibleDonorsList } from "@/components/donor/eligible-donors-list";
import type { EligibleDonor } from "@/components/donor/eligible-donors-list";
import { CRITICAL_THRESHOLD } from "@/lib/constants";

const BLOOD_GROUPS = [
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-",
] as const;

export default function HospitalInventoryPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();

	const {
		data: banks,
		isLoading: banksLoading,
		dataUpdatedAt,
	} = useInventory();

	const { data: donorsData } = useEligibleDonors({ eligibleOnly: true });

	const aggregateInventory = (group: string) =>
		(banks ?? []).reduce(
			(sum, bank) => sum + ((bank.inventory as Record<string, number>)?.[group] ?? 0),
			0,
		);

	const eligibleDonors: EligibleDonor[] = (donorsData?.donors ?? []).map((d) => ({
		id: d.id,
		name: d.name,
		bloodGroup: d.bloodGroup,
		lastDonationDate: d.lastDonationDate?.toISOString() ?? null,
	}));

	const loading = sessionLoading || banksLoading;

	if (loading) {
		return (
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{BLOOD_GROUPS.map((g) => (
					<div
						key={g}
						className="h-32 animate-pulse rounded-xl bg-muted"
					/>
				))}
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
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Live Inventory Grid
					</h1>
					<p className="text-sm text-muted-foreground">
						Real-time blood stock across all BioMatch partner banks
					</p>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<RefreshCw className="h-3.5 w-3.5" />
					{dataUpdatedAt
						? `Synced ${new Date(dataUpdatedAt).toLocaleTimeString()}`
						: "Syncing..."}
				</div>
			</header>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{BLOOD_GROUPS.map((group) => {
					const units = aggregateInventory(group);
					const critical = units < CRITICAL_THRESHOLD;
					return (
						<div
							key={group}
							className={`relative overflow-hidden rounded-xl border p-4 transition-shadow ${
								critical
									? "border-destructive/30 bg-brand-light shadow-[0_0_0_1px_rgba(248,113,113,0.4)] animate-pulse"
									: "border-border bg-white"
							}`}
						>
							{critical && (
								<span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
									<AlertTriangle className="h-3 w-3" />
									Critical
								</span>
							)}
							<div className="flex items-center gap-2 text-muted-foreground">
								<Droplet
									className={`h-4 w-4 ${critical ? "text-brand" : "text-brand-muted"}`}
									fill="currentColor"
								/>
								<span className="text-sm font-medium">
									{group}
								</span>
							</div>
							<p
								className={`mt-3 text-3xl font-bold ${critical ? "text-brand" : "text-foreground"}`}
							>
								{units}
							</p>
							<p className="text-xs text-muted-foreground">
								units available
							</p>
						</div>
					);
				})}
			</div>

			<EligibleDonorsList donors={eligibleDonors} />
		</div>
	);
}
