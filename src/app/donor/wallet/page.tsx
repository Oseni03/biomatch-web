"use client";

import { Wallet, Award } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useWallet } from "@/hooks/use-wallet";

export default function DonorWalletPage() {
	const { data: session } = authClient.useSession();

	const {
		data: wallet,
		isLoading: walletLoading,
	} = useWallet();

	const points = wallet?.points ?? 0;

	if (!session?.user) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p>Sign in to view your wallet</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="on-red relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-hover p-7 text-white shadow-brand">
				<div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white/5 blur-2xl" />
				<div className="flex items-center gap-2 text-white/80">
					<Wallet className="h-4 w-4" />
					<span className="text-xs font-medium uppercase tracking-widest">
						BioMatch Rewards Wallet
					</span>
				</div>
				<div className="mt-5 flex flex-wrap items-end gap-10">
					<div>
						<p className="text-xs font-medium text-white/70">
							Loyalty Points
						</p>
						<p className="mt-1 text-5xl font-bold tracking-tight">
							{walletLoading ? "—" : points}
						</p>
					</div>
					<div>
						<p className="text-xs font-medium text-white/70">
							Lifetime Donations
						</p>
						<p className="mt-1 text-3xl font-semibold">
							{walletLoading
								? "—"
								: (wallet?.lifetimeDonations ?? 0)}
						</p>
					</div>
				</div>
				<p className="mt-5 max-w-md text-xs leading-relaxed text-white/60">
					Points are earned through verified donations.
				</p>
			</div>

			<div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light">
					<Award className="h-4 w-4 text-brand" />
				</div>
				<p className="text-sm text-muted-foreground">
					Redeemable perks are coming soon — keep donating to build up
					your points balance.
				</p>
			</div>
		</div>
	);
}
