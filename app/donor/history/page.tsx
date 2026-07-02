"use client";

import { useState } from "react";
import {
	Loader2,
	Award,
	Droplets,
	Heart,
	Calendar,
	Activity,
	ChevronLeft,
	ChevronRight,
	Bell,
	CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import {
	useDonorHistory,
	useLocalDemandStats,
} from "@/hooks/use-donor-history";
import { getEligibility, ELIGIBILITY_DAYS } from "@/lib/eligibility";
import { displayBloodGroup } from "@/lib/donor-types";

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

	const bloodType = displayBloodGroup(user?.bloodGroup);
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

			{eligibility.eligible && lastDonationDate && (
				<div className="bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/50 rounded-2xl p-4 flex items-center gap-3">
					<CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
					<div>
						<p className="text-sm font-semibold text-green-800 dark:text-green-300">
							You are eligible to donate again!
						</p>
						<p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
							Your 56-day deferral period has ended. Check for
							active emergency requests above.
						</p>
					</div>
				</div>
			)}

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
							remaining until you can donate again. Last donation:{" "}
							{lastDonationDate}
						</p>
					</div>
				</div>
			)}

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 bg-brand-light dark:bg-red-950 rounded-xl flex items-center justify-center">
							<Droplets className="h-5 w-5 text-brand" />
						</div>
					</div>
					<span className="text-2xl font-bold font-mono text-foreground block">
						{completedCount}
					</span>
					<span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
						Total Donations
					</span>
				</div>

				<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
							<Award className="h-5 w-5 text-blue-600" />
						</div>
					</div>
					<span className="text-2xl font-bold font-mono text-foreground block">
						{points}
					</span>
					<span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
						Total Points
					</span>
				</div>

				<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 bg-green-50 dark:bg-green-950 rounded-xl flex items-center justify-center">
							<Heart className="h-5 w-5 text-green-600" />
						</div>
					</div>
					<span className="text-2xl font-bold font-mono text-foreground block">
						{livesImpacted}
					</span>
					<span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
						Lives Impacted
					</span>
				</div>

				<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center">
							<Activity className="h-5 w-5 text-purple-600" />
						</div>
					</div>
					<span className="text-2xl font-bold font-mono text-foreground block">
						{demandLoading
							? "..."
							: (demandStats?.totalThisMonth ?? 0)}
					</span>
					<span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
						Emergencies This Month
					</span>
				</div>
			</div>

			{demandStats && demandStats.totalThisMonth > 0 && (
				<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
					<div className="flex items-center gap-2 mb-4">
						<Activity className="h-4 w-4 text-purple-600" />
						<span className="text-sm font-semibold text-foreground">
							Local Demand — {demandStats.location}
						</span>
					</div>
					<div className="flex gap-6">
						<div>
							<span className="text-lg font-bold font-mono text-foreground block">
								{demandStats.totalThisMonth}
							</span>
							<span className="text-[10px] font-mono uppercase text-muted-foreground">
								Total emergencies
							</span>
						</div>
						<div>
							<span className="text-lg font-bold font-mono text-brand block">
								{demandStats.criticalThisMonth}
							</span>
							<span className="text-[10px] font-mono uppercase text-muted-foreground">
								Critical
							</span>
						</div>
						<div>
							<span className="text-lg font-bold font-mono text-foreground block">
								{demandStats.totalThisMonth > 0
									? `${Math.round(
											(completedCount /
												Math.max(
													1,
													demandStats.totalThisMonth,
												)) *
												100,
										)}%`
									: "0%"}
							</span>
							<span className="text-[10px] font-mono uppercase text-muted-foreground">
								Your coverage
							</span>
						</div>
					</div>
				</div>
			)}

			<div className="bg-white dark:bg-card border border-border dark:border-border rounded-3xl p-6 shadow-sm">
				<div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-border/60 mb-4">
					<div className="flex items-center gap-2">
						<Award className="h-5 w-5 text-brand" />
						<h2 className="text-base font-bold text-foreground">
							Donation History
						</h2>
					</div>
				</div>

				{!historyData || historyData.records.length === 0 ? (
					<div className="text-sm text-muted-foreground p-6 text-center">
						No donation history yet. Complete an emergency response
						to start tracking your impact.
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full text-xs text-left">
								<thead>
									<tr className="border-b border-border dark:border-border text-muted-foreground font-mono uppercase">
										<th className="py-3 px-2">Date</th>
										<th className="py-3 px-2">Hospital</th>
										<th className="py-3 px-2">
											Blood Group
										</th>
										<th className="py-3 px-2 text-right">
											Points
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
									{historyData.records.map((rec) => (
										<tr
											key={rec.id}
											className="hover:bg-muted/50 dark:hover:bg-zinc-850/20"
										>
											<td className="py-3.5 px-2 font-mono text-muted-foreground">
												{rec.date}
											</td>
											<td className="py-3.5 px-2 font-semibold text-foreground">
												{rec.hospitalName}
											</td>
											<td className="py-3.5 px-2 font-mono">
												{displayBloodGroup(
													rec.bloodGroup,
												)}
											</td>
											<td className="py-3.5 px-2 text-right font-mono text-green-600 font-semibold">
												100
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{historyData.totalPages > 1 && (
							<div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-border dark:border-border">
								<button
									onClick={() =>
										setPage((p) => Math.max(1, p - 1))
									}
									disabled={page <= 1}
									className="p-2 rounded-xl border border-border dark:border-zinc-700 hover:bg-muted dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
								>
									<ChevronLeft className="h-4 w-4" />
								</button>
								<span className="text-sm text-muted-foreground font-mono">
									Page {historyData.page} of{" "}
									{historyData.totalPages}
								</span>
								<button
									onClick={() =>
										setPage((p) =>
											Math.min(
												historyData.totalPages,
												p + 1,
											),
										)
									}
									disabled={page >= historyData.totalPages}
									className="p-2 rounded-xl border border-border dark:border-zinc-700 hover:bg-muted dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
								>
									<ChevronRight className="h-4 w-4" />
								</button>
							</div>
						)}
					</>
				)}

				<div className="mt-4 pt-4 border-t border-border dark:border-border text-xs text-muted-foreground flex items-center gap-2">
					<span>
						<strong className="font-semibold text-foreground dark:text-muted-foreground">
							{historyData?.total ?? 0}
						</strong>{" "}
						total donation{historyData?.total !== 1 ? "s" : ""}
					</span>
					<span>&bull;</span>
					<span>
						<strong className="font-semibold text-foreground dark:text-muted-foreground">
							100
						</strong>{" "}
						points per donation
					</span>
				</div>
			</div>
		</div>
	);
}
