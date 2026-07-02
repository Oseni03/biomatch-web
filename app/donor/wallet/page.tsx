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
			<div className="rounded-2xl bg-gradient-to-br from-brand to-brand-hover p-6 text-white shadow-lg">
				<div className="flex items-center gap-2 text-rose-100">
					<Wallet className="h-4.5 w-4.5" />
					<span className="text-sm font-medium">
						BioMatch Rewards Wallet
					</span>
				</div>
				<div className="mt-4 flex flex-wrap items-end gap-8">
					<div>
						<p className="text-xs text-rose-100">Loyalty Points</p>
						<p className="text-4xl font-bold">
							{walletLoading ? "—" : points}
						</p>
					</div>
					<div>
						<p className="text-xs text-rose-100">
							Lifetime Donations
						</p>
						<p className="text-2xl font-semibold">
							{walletLoading
								? "—"
								: (wallet?.lifetimeDonations ?? 0)}
						</p>
					</div>
				</div>
				<p className="mt-4 max-w-md text-xs text-rose-100">
					Points are earned through verified donations and redeemed
					for non-cash health and wellness perks below.
				</p>
			</div>

			<section>
				<h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
					<Award className="h-4 w-4 text-brand" />
					Available Perks
				</h2>
				<div className="grid gap-4 sm:grid-cols-2">
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
		<div className="rounded-xl border border-border bg-white p-5">
			<div className="flex items-start justify-between">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
					<Icon className="h-5 w-5 text-brand" />
				</div>
				{!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
				{unlocked && !redeemed && (
					<CheckCircle2 className="h-4 w-4 text-emerald-500" />
				)}
			</div>
			<h3 className="mt-3 text-sm font-semibold text-foreground">
				{title}
			</h3>
			<p className="mt-1 text-xs text-muted-foreground">{description}</p>

			<div className="mt-4">
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						className={`h-full rounded-full ${unlocked ? "bg-emerald-500" : "bg-rose-400"}`}
						style={{ width: `${progress}%` }}
					/>
				</div>
				<p className="mt-1.5 text-[11px] text-muted-foreground">
					{currentPoints}/{pointsRequired} points
				</p>
			</div>

			<button
				disabled={!unlocked || redeemed || loading}
				onClick={onRedeem}
				className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
					redeemed
						? "bg-emerald-50 text-emerald-700"
						: unlocked
							? "bg-brand text-white hover:bg-brand-hover"
							: "bg-muted text-muted-foreground"
				}`}
			>
				<Ticket className="h-3.5 w-3.5" />
				{redeemed
					? "Voucher Redeemed"
					: loading
						? "Processing..."
						: unlocked
							? "Redeem Voucher Code"
							: "Locked"}
			</button>
		</div>
	);
}
