"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Gift, Loader2, Ticket, Wallet } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatKoboToNaira } from "@/lib/money";
import { useWalletBalance, useWalletLedger } from "@/hooks/use-wallet";
import { useIssueVoucher, useMyVouchers } from "@/hooks/use-vouchers";
import { useActiveMerchants } from "@/hooks/use-merchants";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { PaginationControls } from "@/components/ui/pagination-controls";

const ENTRY_LABELS: Record<string, string> = {
	donation_reward: "Donation reward",
	redemption: "Voucher redemption",
	adjustment: "Balance adjustment",
	reversal: "Refund",
};

const VOUCHER_STATUS_STYLES: Record<string, string> = {
	issued: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
	redeemed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
	expired: "bg-muted text-muted-foreground",
	cancelled: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
};

export function RewardsClient() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const [page, setPage] = useState(1);
	const [voucherPage, setVoucherPage] = useState(1);
	const { data: balance, isLoading: balanceLoading } = useWalletBalance();
	const { data: ledger, isLoading: ledgerLoading } = useWalletLedger(page);
	const { data: merchants, isLoading: merchantsLoading } = useActiveMerchants();
	const { data: vouchers, isLoading: vouchersLoading } = useMyVouchers(voucherPage);
	const issueVoucher = useIssueVoucher();

	const [merchantId, setMerchantId] = useState("");
	const [amountNaira, setAmountNaira] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

	useEffect(() => {
		setIdempotencyKey(crypto.randomUUID());
	}, [merchantId, amountNaira]);

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
	const merchantOptions = merchants ?? [];
	const voucherItems = vouchers?.vouchers ?? [];
	const voucherTotalPages = vouchers?.totalPages ?? 1;
	const issued = issueVoucher.data ?? null;

	function handleRedeem() {
		setFormError(null);
		const parsed = Number.parseFloat(amountNaira);
		if (!merchantId) {
			setFormError("Choose a merchant for your voucher.");
			return;
		}
		if (!Number.isFinite(parsed) || parsed <= 0) {
			setFormError("Enter an amount greater than ₦0.00.");
			return;
		}
		const amountKobo = Math.round(parsed * 100);
		if (amountKobo > balanceKobo) {
			setFormError("That amount is more than your wallet balance.");
			return;
		}
		issueVoucher.mutate(
			{ merchantId, amountKobo, idempotencyKey },
			{
				onSuccess: () => {
					setAmountNaira("");
					setIdempotencyKey(crypto.randomUUID());
				},
			},
		);
	}

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
				<h2 className="text-base font-bold text-foreground">Redeem a voucher</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Available balance: {formatKoboToNaira(balanceKobo)}. Show the code at
					the merchant to pay.
				</p>
				{issued ? (
					<div className="mt-4 rounded-xl border border-emerald-600/30 bg-emerald-50 p-4 dark:bg-emerald-950/40">
						<p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
							Voucher ready
						</p>
						<p className="mt-1 font-mono text-2xl font-bold tracking-widest text-foreground">
							{issued.code}
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{formatKoboToNaira(issued.amountKobo)} at {issued.merchantName} ·
							valid until {new Date(issued.expiresAt).toLocaleDateString()}
						</p>
						<button
							type="button"
							onClick={() => issueVoucher.reset()}
							className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
						>
							Issue another voucher
						</button>
					</div>
				) : merchantsLoading ? (
					<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading merchants…
					</div>
				) : merchantOptions.length === 0 ? (
					<p className="mt-4 text-sm text-muted-foreground">
						No merchants are accepting vouchers right now. Check back later.
					</p>
				) : (
					<div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
						<label className="grid gap-1 text-sm">
							<span className="font-semibold text-foreground">Merchant</span>
							<select
								value={merchantId}
								onChange={(event) => setMerchantId(event.target.value)}
								className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
							>
								<option value="">Choose a merchant…</option>
								{merchantOptions.map((merchant) => (
									<option key={merchant.id} value={merchant.id}>
										{merchant.name}
									</option>
								))}
							</select>
						</label>
						<label className="grid gap-1 text-sm">
							<span className="font-semibold text-foreground">Amount (₦)</span>
							<input
								value={amountNaira}
								onChange={(event) => setAmountNaira(event.target.value)}
								inputMode="decimal"
								placeholder="500.00"
								className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
							/>
						</label>
						<button
							type="button"
							onClick={handleRedeem}
							disabled={issueVoucher.isPending}
							className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground self-end disabled:opacity-50"
						>
							{issueVoucher.isPending ? "Issuing…" : "Get voucher"}
						</button>
					</div>
				)}
				{(formError ?? (issueVoucher.isError ? (issueVoucher.error as Error).message : null)) && !issued ? (
					<p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
						{formError ?? (issueVoucher.error as Error).message}
					</p>
				) : null}
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">My vouchers</h2>
				{vouchersLoading ? (
					<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading vouchers…
					</div>
				) : voucherItems.length === 0 ? (
					<div className="mt-4 flex flex-col items-center gap-2 py-10 text-center">
						<Ticket className="h-8 w-8 text-muted-foreground" />
						<p className="text-sm font-semibold text-foreground">No vouchers yet</p>
						<p className="max-w-sm text-sm text-muted-foreground">
							Issue your first voucher above and it will appear here with its
							code, value and expiry date.
						</p>
					</div>
				) : (
					<ul className="mt-4 divide-y divide-border">
						{voucherItems.map((voucher) => (
							<li key={voucher.id} className="flex items-center gap-3 py-3">
								<Ticket className="h-4 w-4 shrink-0 text-muted-foreground" />
								<div className="min-w-0 flex-1">
									<p className="truncate font-mono text-sm font-bold tracking-wider text-foreground">
										{voucher.code}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{voucher.merchantName} · {formatKoboToNaira(voucher.amountKobo)} ·
										expires {new Date(voucher.expiresAt).toLocaleDateString()}
									</p>
								</div>
								<span
									className={`rounded-full px-2 py-0.5 text-xs font-bold ${VOUCHER_STATUS_STYLES[voucher.status] ?? VOUCHER_STATUS_STYLES.expired}`}
								>
									{voucher.status}
								</span>
							</li>
						))}
					</ul>
				)}
				<PaginationControls page={voucherPage} totalPages={voucherTotalPages} onPageChange={setVoucherPage} />
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
