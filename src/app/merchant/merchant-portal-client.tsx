"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldX, Store, Ticket } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatKoboToNaira } from "@/lib/money";
import {
	useMerchantContext,
	useMerchantRedemptions,
	usePreviewVoucher,
	useRedeemVoucher,
} from "@/hooks/use-merchant-portal";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Wordmark } from "@/components/brand/wordmark";

export function MerchantPortalClient({ hasAccess }: { hasAccess: boolean }) {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const [historyPage, setHistoryPage] = useState(1);
	const { data: context, isLoading: contextLoading } = useMerchantContext();
	const { data: history, isLoading: historyLoading } = useMerchantRedemptions(historyPage);
	const preview = usePreviewVoucher();
	const redeem = useRedeemVoucher();

	const [code, setCode] = useState("");

	if (sessionLoading || contextLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user || !hasAccess || !context) {
		return (
			<div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
				<ShieldX className="h-10 w-10 text-muted-foreground" />
				<h1 className="text-lg font-bold text-foreground">Merchant portal</h1>
				<p className="text-sm text-muted-foreground">
					This account is not linked to an active merchant. If you are a
					merchant cashier, ask your administrator to link your account,
					then sign in again.
				</p>
			</div>
		);
	}

	const previewData = preview.data ?? null;
	const receipt = redeem.data ?? null;
	const items = history?.redemptions ?? [];
	const totalPages = history?.totalPages ?? 1;
	const failure = preview.isError || redeem.isError;
	const failureMessage = failure
		? (preview.error as Error | null)?.message ??
			(redeem.error as Error).message
		: null;

	function handleCheck() {
		preview.mutate(code, {
			onSuccess: () => redeem.reset(),
		});
	}

	function handleConfirm() {
		if (!previewData) return;
		redeem.mutate(previewData.code, {
			onSuccess: () => {
				preview.reset();
				setCode("");
			},
		});
	}

	return (
		<div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
			<div className="flex items-center gap-3">
				<Store className="h-6 w-6 text-foreground" />
				<div>
					<h1 className="text-lg font-bold text-foreground">{context.merchantName}</h1>
					<p className="text-sm text-muted-foreground">Donor reward redemptions — honoring life-saving donations, powered by <Wordmark size="sm" className="inline" /></p>
				</div>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Redeem a voucher</h2>
				{receipt ? (
					<div className="mt-4 rounded-xl border border-emerald-600/30 bg-emerald-50 p-4 dark:bg-emerald-950/40">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5 text-emerald-600" />
							<p className="text-sm font-bold text-foreground">Redeemed</p>
						</div>
						<p className="mt-1 font-mono text-xl font-bold tracking-widest text-foreground">
							{receipt.code}
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							{formatKoboToNaira(receipt.amountKobo)} ·{" "}
							{new Date(receipt.redeemedAt).toLocaleString()}
						</p>
						<button
							type="button"
							onClick={() => redeem.reset()}
							className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
						>
							Redeem another code
						</button>
					</div>
				) : (
					<div className="mt-4 space-y-3">
						<div className="flex gap-2">
							<input
								value={code}
								onChange={(event) => setCode(event.target.value)}
								placeholder="XXXX-XXXX-XXXX"
								autoComplete="off"
								spellCheck={false}
								className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm tracking-widest text-foreground uppercase"
							/>
							<button
								type="button"
								onClick={handleCheck}
								disabled={preview.isPending || code.trim().length === 0}
								className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
							>
								{preview.isPending ? "Checking…" : "Check"}
							</button>
						</div>
						{previewData ? (
							<div className="rounded-xl border border-border p-4">
								<p className="font-mono text-lg font-bold tracking-widest text-foreground">
									{previewData.code}
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{formatKoboToNaira(previewData.amountKobo)} · valid until{" "}
									{new Date(previewData.expiresAt).toLocaleDateString()}
								</p>
								<button
									type="button"
									onClick={handleConfirm}
									disabled={redeem.isPending}
									className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
								>
									{redeem.isPending ? "Confirming…" : `Confirm ${formatKoboToNaira(previewData.amountKobo)}`}
								</button>
							</div>
						) : null}
						{failureMessage ? (
							<p className="text-sm font-semibold text-red-600 dark:text-red-400">
								{failureMessage}
							</p>
						) : null}
					</div>
				)}
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Redemption history</h2>
				{historyLoading ? (
					<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading history…
					</div>
				) : items.length === 0 ? (
					<div className="mt-4 flex flex-col items-center gap-2 py-10 text-center">
						<Ticket className="h-8 w-8 text-muted-foreground" />
						<p className="text-sm font-semibold text-foreground">No redemptions yet</p>
						<p className="max-w-sm text-sm text-muted-foreground">
							Vouchers you redeem at {context.merchantName} will appear here
							with their code, value and who confirmed them.
						</p>
					</div>
				) : (
					<ul className="mt-4 divide-y divide-border">
						{items.map((item) => (
							<li key={item.id} className="flex items-center gap-3 py-3">
								<Ticket className="h-4 w-4 shrink-0 text-muted-foreground" />
								<div className="min-w-0 flex-1">
									<p className="truncate font-mono text-sm font-bold tracking-wider text-foreground">
										{item.code}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{formatKoboToNaira(item.amountKobo)} · donor {item.donorCode} ·{" "}
										{item.status === "redeemed" && item.redeemedAt
											? `redeemed ${new Date(item.redeemedAt).toLocaleDateString()}${item.redeemedByName ? ` by ${item.redeemedByName}` : ""}`
											: item.status}
									</p>
								</div>
								<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
									{item.status}
								</span>
							</li>
						))}
					</ul>
				)}
				<PaginationControls page={historyPage} totalPages={totalPages} onPageChange={setHistoryPage} />
			</div>
		</div>
	);
}
