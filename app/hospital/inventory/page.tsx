"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Droplet, Users, RefreshCw } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { listDonors } from "@/servers/user";
import { getAllHospitalBanks } from "@/servers/hospital";
import { useRouter } from "next/navigation";

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
const ELIGIBILITY_DAYS = 56;

interface HospitalBank {
	id: string;
	hospital_name: string;
	location: string;
	inventory: Record<string, number>;
	updated_at: string;
}

interface EligibleDonor {
	id: string;
	full_name: string;
	blood_group: string | null;
	last_donation_date: string | null;
}

export default function HospitalInventoryPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const router = useRouter();

	const [banks, setBanks] = useState<HospitalBank[]>([]);
	const [donors, setDonors] = useState<EligibleDonor[]>([]);
	const [loading, setLoading] = useState(true);
	const [lastSync, setLastSync] = useState<Date | null>(null);

	const fetchBanks = useCallback(async () => {
		try {
			const data = await getAllHospitalBanks();
			setBanks(
				data.map((bank) => ({
					id: bank.id,
					hospital_name: bank.hospitalName,
					location: bank.location,
					inventory: bank.inventory as Record<string, number>,
					updated_at: bank.updatedAt.toISOString(),
				})),
			);
			setLastSync(new Date());
		} catch (err) {
			console.error("Failed to fetch banks:", err);
		}
	}, []);

	const fetchEligibleDonors = useCallback(async () => {
		try {
			const cutoff = new Date();
			cutoff.setDate(cutoff.getDate() - ELIGIBILITY_DAYS);

			// Use existing service or extend UserService for eligible donors
			const allDonors = await listDonors();

			const eligible = allDonors
				.filter((donor) => {
					if (!donor.lastDonationDate) return true;
					const last = new Date(donor.lastDonationDate);
					return last < cutoff;
				})
				.slice(0, 20)
				.map((donor) => ({
					id: donor.id,
					full_name: donor.name,
					blood_group: donor.bloodGroup,
					last_donation_date:
						donor.lastDonationDate?.toISOString() ?? null,
				}));

			setDonors(eligible);
		} catch (err) {
			console.error("Failed to fetch eligible donors:", err);
		}
	}, []);

	useEffect(() => {
		if (sessionLoading) return;

		setLoading(true);
		Promise.all([fetchBanks(), fetchEligibleDonors()]).finally(() =>
			setLoading(false),
		);

		// Optional: Polling as fallback since Supabase realtime is being phased out
		const interval = setInterval(() => {
			fetchBanks();
		}, 10000); // Refresh every 10s

		return () => clearInterval(interval);
	}, [fetchBanks, fetchEligibleDonors, sessionLoading]);

	const aggregateInventory = (group: string) =>
		banks.reduce((sum, bank) => sum + (bank.inventory?.[group] ?? 0), 0);

	if (sessionLoading || loading) {
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
		return router.push("/auth/login");
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
					{lastSync
						? `Synced ${lastSync.toLocaleTimeString()}`
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

			<section className="rounded-xl border border-gray-200 bg-white">
				<div className="flex items-center gap-2 border-b px-5 py-4">
					<Users className="h-4.5 w-4.5 text-rose-600" />
					<h2 className="text-sm font-semibold text-gray-900">
						Eligible BioMatch Donors
					</h2>
					<span className="ml-auto text-xs text-gray-400">
						Last donation 56+ days ago or never donated
					</span>
				</div>
				<div className="divide-y">
					{donors.length === 0 ? (
						<p className="px-5 py-6 text-sm text-gray-400">
							No eligible donors found right now.
						</p>
					) : (
						donors.map((donor) => (
							<div
								key={donor.id}
								className="flex items-center justify-between px-5 py-3"
							>
								<div>
									<p className="text-sm font-medium text-gray-900">
										{donor.full_name}
									</p>
									<p className="text-xs text-gray-400">
										{donor.last_donation_date
											? `Last donated ${new Date(donor.last_donation_date).toLocaleDateString()}`
											: "No prior donation on record"}
									</p>
								</div>
								<span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
									{donor.blood_group ?? "Unknown"}
								</span>
							</div>
						))
					)}
				</div>
			</section>
		</div>
	);
}
