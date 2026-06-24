"use client";

import { AlertTriangle, Droplet, RefreshCw } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useInventory } from "@/hooks/use-inventory";
import { useEligibleDonors } from "@/hooks/use-eligible-donors";
import { EligibleDonorsList } from "@/components/donor/eligible-donors-list";
import type { EligibleDonor } from "@/components/donor/eligible-donors-list";

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
const CRITICAL_THRESHOLD = 5;

export default function HospitalInventoryPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();

	const {
		data: banks,
		isLoading: banksLoading,
		dataUpdatedAt,
	} = useInventory();

	const { data: donors } = useEligibleDonors();

	const aggregateInventory = (group: string) =>
		(banks ?? []).reduce(
			(sum, bank) => sum + ((bank.inventory as Record<string, number>)?.[group] ?? 0),
			0,
		);

	const eligibleDonors: EligibleDonor[] = (donors ?? []).map((d) => ({
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
						className="h-32 animate-pulse rounded-xl bg-gray-100"
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
					<h1 className="text-2xl font-bold text-gray-900">
						Live Inventory Grid
					</h1>
					<p className="text-sm text-gray-500">
						Real-time blood stock across all BioMatch partner banks
					</p>
				</div>
				<div className="flex items-center gap-2 text-xs text-gray-400">
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
									? "border-red-300 bg-red-50 shadow-[0_0_0_1px_rgba(248,113,113,0.4)] animate-pulse"
									: "border-gray-200 bg-white"
							}`}
						>
							{critical && (
								<span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
									<AlertTriangle className="h-3 w-3" />
									Critical
								</span>
							)}
							<div className="flex items-center gap-2 text-gray-400">
								<Droplet
									className={`h-4 w-4 ${critical ? "text-red-500" : "text-rose-400"}`}
									fill="currentColor"
								/>
								<span className="text-sm font-medium">
									{group}
								</span>
							</div>
							<p
								className={`mt-3 text-3xl font-bold ${critical ? "text-red-600" : "text-gray-900"}`}
							>
								{units}
							</p>
							<p className="text-xs text-gray-400">
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
