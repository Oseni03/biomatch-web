"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Gift, Loader2, Wallet } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatKoboToNaira } from "@/lib/money";
import { useWalletBalance, useWalletLedger } from "@/hooks/use-wallet";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { PaginationControls } from "@/components/ui/pagination-controls";

const ENTRY_LABELS: Record<string, string> = {
	donation_reward: "Donation reward",
	redemption: "Voucher redemption",
	adjustment: "Balance adjustment",
	reversal: "Refund",
};

export function RewardsClient() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const [page, setPage] = useState(1);
	const { data: balance, isLoading: balanceLoading } = useWalletBalance();
	const { data: ledger, isLoading: ledgerLoading } = useWalletLedger(page);

	if (sessionLoading || balanceLoading || ledgerLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">
				Sign in to view your rewards.
			</p>
		);
	}

	const balanceKobo = balance?.balanceKobo ?? 0;
	const entries = ledger?.entries ?? [];
	const totalPages = ledger?.totalPages ?? 1;

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Rewards Wallet"
				subtitle="Your balance and reward history from completed donations"
			/>

			<div className="grid gap-4 sm:grid-cols-2">
				<StatCard
					label="Wallet balance"
					value={formatKoboToNaira(balanceKobo)}
					icon={Wallet}
				/>
				<StatCard
					label="Rewards earned"
					value={String(ledger?.total ?? 0)}
					icon={Gift}
				/>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Transaction history</h2>
				{entries.length === 0 ? (
					<div className="mt-4 flex flex-col items-center gap-2 py-10 text-center">
						<Gift className="h-8 w-8 text-muted-foreground" />
						<p className="text-sm font-semibold text-foreground">No rewards earned yet</p>
						<p className="max-w-sm text-sm text-muted-foreground">
							Complete a blood donation and have it confirmed by both sides to
							earn your first reward. It will appear here with its date and
							description.
						</p>
					</div>
				) : (
					<ul className="mt-4 divide-y divide-border">
						{entries.map((entry) => {
							const isCredit = entry.amountKobo >= 0;
							return (
								<li key={entry.id} className="flex items-center gap-3 py-3">
									{isCredit ? (
										<ArrowDownLeft className="h-4 w-4 shrink-0 text-emerald-600" />
									) : (
										<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
									)}
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold text-foreground">
											{ENTRY_LABELS[entry.entryType] ?? entry.entryType}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{entry.description ?? "No description"} ·{" "}
											{new Date(entry.createdAt).toLocaleDateString()}
										</p>
									</div>
									<p
										className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-foreground"}`}
									>
										{isCredit ? "+" : ""}
										{formatKoboToNaira(entry.amountKobo)}
									</p>
								</li>
							);
						})}
					</ul>
				)}
				<PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
			</div>
		</div>
	);
}
