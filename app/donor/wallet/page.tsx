"use client";

import {
	Wallet,
	Award,
	HeartHandshake,
	Dumbbell,
	Lock,
	CheckCircle2,
	Ticket,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { createIncentiveClaim, getClaimsByUserId } from "@/servers/incentive";
import { useWallet } from "@/hooks/use-wallet";
import { toast } from "sonner";
import { useState } from "react";

const HMO_POINTS_REQUIRED = 300;
const GYM_POINTS_REQUIRED = 150;

interface Claim {
	id: string;
	type: "hmo_voucher" | "gym_discount";
	status: "pending" | "approved" | "redeemed";
}

export default function DonorWalletPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const queryClient = useQueryClient();

	const {
		data: wallet,
		isLoading: walletLoading,
		error: walletError,
	} = useWallet();

	const { data: claimsData } = useQuery({
		queryKey: ["claims", session?.user?.id],
		queryFn: () => getClaimsByUserId(session!.user!.id),
		enabled: !!session?.user?.id,
	});

	const [redeeming, setRedeeming] = useState<string | null>(null);

	const claims: Claim[] = (claimsData ?? []).map((c) => ({
		id: c.id,
		type: c.type,
		status: c.status,
	}));

	const hasActiveClaim = (type: Claim["type"]) =>
		claims.some(
			(c) =>
				c.type === type &&
				(c.status === "approved" || c.status === "redeemed"),
		);

	const handleRedeem = async (type: Claim["type"]) => {
		if (!session?.user?.id) return;

		setRedeeming(type);

		try {
			await createIncentiveClaim(session.user.id, type);
			queryClient.invalidateQueries({ queryKey: ["claims"] });
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
			toast.success("Voucher claimed successfully");
		} catch {
			toast.error("Failed to create claim");
		} finally {
			setRedeeming(null);
		}
	};

	if (walletError) {
		toast.error("Failed to load wallet data");
	}

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
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-hover p-7 text-white shadow-lg">
				<div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white/5 blur-2xl" />
				<div className="flex items-center gap-2 text-rose-100/80">
					<Wallet className="h-4 w-4" />
					<span className="text-xs font-medium uppercase tracking-widest">
						BioMatch Rewards Wallet
					</span>
				</div>
				<div className="mt-5 flex flex-wrap items-end gap-10">
					<div>
						<p className="text-xs font-medium text-rose-100/70">
							Loyalty Points
						</p>
						<p className="mt-1 text-5xl font-bold tracking-tight">
							{walletLoading ? "—" : points}
						</p>
					</div>
					<div>
						<p className="text-xs font-medium text-rose-100/70">
							Lifetime Donations
						</p>
						<p className="mt-1 text-3xl font-semibold">
							{walletLoading
								? "—"
								: (wallet?.lifetimeDonations ?? 0)}
						</p>
					</div>
				</div>
				<p className="mt-5 max-w-md text-xs leading-relaxed text-rose-100/60">
					Points are earned through verified donations and redeemed
					for non-cash health and wellness perks below.
				</p>
			</div>

			<section>
				<div className="mb-5 flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light dark:bg-red-900/30">
						<Award className="h-4 w-4 text-brand" />
					</div>
					<div>
						<h2 className="text-sm font-bold text-foreground">
							Available Perks
						</h2>
						<p className="text-[11px] text-muted-foreground">
							Redeem your loyalty points for exclusive rewards
						</p>
					</div>
				</div>
				<div className="grid gap-5 sm:grid-cols-2">
					<PerkCard
						icon={HeartHandshake}
						title="HMO Access Voucher"
						description="Unlock subsidized health insurance enrollment support."
						pointsRequired={HMO_POINTS_REQUIRED}
						currentPoints={points}
						redeemed={hasActiveClaim("hmo_voucher")}
						loading={redeeming === "hmo_voucher"}
						onRedeem={() => handleRedeem("hmo_voucher")}
					/>
					<PerkCard
						icon={Dumbbell}
						title="Fitness Center Discount"
						description="Unlock a discount code for partner gyms and fitness centers."
						pointsRequired={GYM_POINTS_REQUIRED}
						currentPoints={points}
						redeemed={hasActiveClaim("gym_discount")}
						loading={redeeming === "gym_discount"}
						onRedeem={() => handleRedeem("gym_discount")}
					/>
				</div>
			</section>
		</div>
	);
}

interface PerkCardProps {
	icon: React.ElementType;
	title: string;
	description: string;
	pointsRequired: number;
	currentPoints: number;
	redeemed: boolean;
	loading: boolean;
	onRedeem: () => void;
}

function PerkCard({
	icon: Icon,
	title,
	description,
	pointsRequired,
	currentPoints,
	redeemed,
	loading,
	onRedeem,
}: PerkCardProps) {
	const unlocked = currentPoints >= pointsRequired;
	const progress = Math.min(
		100,
		Math.round((currentPoints / pointsRequired) * 100),
	);

	return (
		<div
			className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
				redeemed
					? "border-emerald-200 bg-emerald-50/50 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/10"
					: unlocked
						? "border-border bg-card shadow-card hover:shadow-card-hover dark:border-zinc-700"
						: "border-border/60 bg-muted/30 shadow-sm dark:border-zinc-800"
			}`}
		>
			{unlocked && !redeemed && (
				<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/5 blur-2xl" />
			)}

			<div className="flex items-start justify-between">
				<div
					className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
						redeemed
							? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
							: unlocked
								? "bg-brand-light text-brand dark:bg-red-900/30 dark:text-red-400"
								: "bg-muted text-muted-foreground dark:bg-zinc-800"
					}`}
				>
					<Icon className="h-5 w-5" />
				</div>
				{!unlocked && !redeemed && (
					<span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider text-muted-foreground dark:bg-zinc-800">
						Locked
					</span>
				)}
				{unlocked && !redeemed && (
					<span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider text-green-700 dark:bg-green-900/30 dark:text-green-400">
						Available
					</span>
				)}
				{redeemed && (
					<span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
						Redeemed
					</span>
				)}
			</div>

			<div className="mt-4">
				<h3
					className={`text-sm font-semibold ${
						redeemed
							? "text-emerald-800 dark:text-emerald-300"
							: unlocked
								? "text-foreground"
								: "text-muted-foreground"
					}`}
				>
					{title}
				</h3>
				<p
					className={`mt-1 text-xs leading-relaxed ${
						redeemed
							? "text-emerald-600/80 dark:text-emerald-400/70"
							: unlocked
								? "text-muted-foreground"
								: "text-muted-foreground/60"
					}`}
				>
					{description}
				</p>
			</div>

			<div className="mt-5">
				<div className="flex items-center justify-between text-[11px] font-mono">
					<span
						className={`font-semibold ${
							redeemed
								? "text-emerald-700 dark:text-emerald-400"
								: unlocked
									? "text-brand"
									: "text-muted-foreground"
						}`}
					>
						{currentPoints} / {pointsRequired}
					</span>
					<span
						className={
							redeemed
								? "text-emerald-500 dark:text-emerald-400"
								: "text-muted-foreground"
						}
					>
						{unlocked ? "Unlocked" : `${pointsRequired - currentPoints} more needed`}
					</span>
				</div>
				<div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted dark:bg-zinc-800">
					<div
						className={`h-full rounded-full transition-all duration-700 ${
							redeemed
								? "bg-emerald-400"
								: unlocked
									? "bg-gradient-to-r from-brand to-rose-400"
									: "bg-muted-foreground/30"
						}`}
						style={{ width: `${Math.max(4, progress)}%` }}
					/>
				</div>
			</div>

			<button
				disabled={!unlocked || redeemed || loading}
				onClick={onRedeem}
				className={`mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
					redeemed
						? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
						: unlocked
							? "bg-brand text-white shadow-brand hover:bg-brand-hover hover:shadow-lg active:scale-[0.97] dark:shadow-brand/20"
							: "cursor-not-allowed bg-muted text-muted-foreground/50 dark:bg-zinc-800"
				}`}
			>
				{redeemed ? (
					<>
						<CheckCircle2 className="h-4 w-4" />
						Voucher Redeemed
					</>
				) : loading ? (
					<>
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
						Processing...
					</>
				) : unlocked ? (
					<>
						<Ticket className="h-4 w-4" />
						Redeem Voucher
					</>
				) : (
					<>
						<Lock className="h-4 w-4" />
						Locked
					</>
				)}
			</button>
		</div>
	);
}
