"use client";

import { useState } from "react";
import { Loader2, Calendar, MapPin, Activity, Heart } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import {
	useDonorHistory,
	useLocalDemandStats,
} from "@/hooks/use-donor-history";
import { getEligibility } from "@/lib/eligibility";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function DonorHistoryClient() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const { data: user, isLoading: userLoading } = useDonorDashboard();
	const [page, setPage] = useState(1);
	const { data: historyData, isLoading: historyLoading } =
		useDonorHistory(page);
	const { data: demandStats, isLoading: demandLoading } =
		useLocalDemandStats();

	const isLoading = sessionLoading || userLoading || historyLoading;

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">
				Sign in to view your donation history.
			</p>
		);
	}

	const lastDonationDate = user?.lastDonationDate
		? new Date(user.lastDonationDate).toISOString().slice(0, 10)
		: null;
	const eligibility = getEligibility(lastDonationDate);
	const walletData = user?.wallet;
	const completedCount = walletData?.lifetimeDonations ?? 0;
	const points = walletData?.points ?? 0;
	const livesImpacted = completedCount * 2;

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Donation History & Impact"
				subtitle="Track your life-saving contributions and local demand"
			/>

			{!eligibility.eligible && lastDonationDate && (
				<div className="bg-status-low-bg border border-status-low/20 rounded-2xl p-4 flex items-center gap-3">
					<Calendar className="h-5 w-5 text-status-low shrink-0" />
					<div>
						<p className="text-sm font-semibold text-status-low">
							Deferral period active
						</p>
						<p className="text-xs text-status-low/80 mt-0.5">
							{eligibility.daysRemaining} day
							{eligibility.daysRemaining !== 1 ? "s" : ""}{" "}
							remaining until you can donate again. Last
							donation: {lastDonationDate}
						</p>
					</div>
				</div>
			)}

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					icon={Activity}
					label="Donations"
					value={String(completedCount)}
				/>
				<StatCard
					icon={Heart}
					label="Lives Saved"
					value={String(livesImpacted)}
				/>
				<StatCard
					icon={MapPin}
					label="Local Requests"
					value={String(demandStats?.totalThisMonth ?? 0)}
				/>
				<StatCard
					icon={Activity}
					label="Points"
					value={String(points)}
				/>
			</div>

			<div className="rounded-xl border border-border bg-card overflow-hidden">
				<div className="p-4 border-b border-border">
					<h3 className="font-semibold">Donation Records</h3>
				</div>
				<div className="divide-y divide-border">
					{(historyData?.records ?? []).length === 0 ? (
						<p className="p-8 text-center text-sm text-muted-foreground">
							No donations yet. Your completed donations will appear here.
						</p>
					) : (
						(historyData?.records ?? []).map((record) => (
							<div key={record.id} className="p-4 flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">{record.hospitalName}</p>
									<p className="text-xs text-muted-foreground">
										{record.date} &middot; {record.bloodGroup}
									</p>
								</div>
								<span className="text-xs font-mono text-muted-foreground">
									{record.unitsNeeded} unit{record.unitsNeeded !== 1 ? "s" : ""}
								</span>
							</div>
						))
					)}
				</div>
			</div>

			{historyData && historyData.totalPages > 1 && (
				<PaginationControls
					page={page}
					totalPages={historyData.totalPages}
					onPageChange={setPage}
					variant="numbered"
				/>
			)}
		</div>
	);
}
