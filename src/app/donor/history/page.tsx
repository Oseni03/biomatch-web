"use client";

import { useState } from "react";
import { Loader2, Calendar } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import {
	useDonorHistory,
	useLocalDemandStats,
} from "@/hooks/use-donor-history";
import { getEligibility } from "@/lib/eligibility";
import { EligibilityBanner } from "@/components/donor/eligibility-banner";
import { DonationStatsGrid } from "@/components/donor/donation-stats-grid";
import { LocalDemandCard } from "@/components/donor/local-demand-card";
import { DonationHistoryTable } from "@/components/donor/donation-history-table";

export default function DonorHistoryPage() {
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
			<div>
				<h1 className="text-2xl font-bold text-foreground">
					Donation History & Impact
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Track your life-saving contributions and local demand
				</p>
			</div>

			{eligibility.eligible && lastDonationDate && <EligibilityBanner />}

			{!eligibility.eligible && lastDonationDate && (
				<div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-center gap-3">
					<Calendar className="h-5 w-5 text-amber-600 shrink-0" />
					<div>
						<p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
							Deferral period active
						</p>
						<p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
							{eligibility.daysRemaining} day
							{eligibility.daysRemaining !== 1 ? "s" : ""}{" "}
							remaining until you can donate again. Last
							donation: {lastDonationDate}
						</p>
					</div>
				</div>
			)}

			<DonationStatsGrid
				completedCount={completedCount}
				points={points}
				livesImpacted={livesImpacted}
				emergenciesThisMonth={demandStats?.totalThisMonth ?? 0}
				demandLoading={demandLoading}
			/>

			{demandStats && demandStats.totalThisMonth > 0 && (
				<LocalDemandCard
					location={demandStats.location}
					totalThisMonth={demandStats.totalThisMonth}
					criticalThisMonth={demandStats.criticalThisMonth}
					completedCount={completedCount}
				/>
			)}

			<DonationHistoryTable
				records={historyData?.records ?? []}
				total={historyData?.total ?? 0}
				page={historyData?.page ?? page}
				totalPages={historyData?.totalPages ?? 1}
				onPageChange={setPage}
			/>
		</div>
	);
}
