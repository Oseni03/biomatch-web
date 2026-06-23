"use client";

import { useEffect, useState, useCallback } from "react";
import {
	Wallet,
	Award,
	HeartHandshake,
	Dumbbell,
	Lock,
	CheckCircle2,
	Ticket,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { createIncentiveClaim, getClaimsByUserId } from "@/servers/incentive";
import { getWalletByUserId } from "@/servers/wallet";
import { useRouter } from "next/navigation";

const HMO_POINTS_REQUIRED = 300;
const GYM_POINTS_REQUIRED = 150;

interface WalletData {
	points: number;
	lifetime_donations: number;
}

interface Claim {
	id: string;
	type: "hmo_voucher" | "gym_discount";
	status: "pending" | "approved" | "redeemed";
}

export default function DonorWalletPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const router = useRouter();

	const [wallet, setWallet] = useState<WalletData | null>(null);
	const [claims, setClaims] = useState<Claim[]>([]);
	const [loading, setLoading] = useState(true);
	const [redeeming, setRedeeming] = useState<string | null>(null);

	const fetchWallet = useCallback(async () => {
		if (!session?.user?.id) return;

		try {
			// Fetch wallet
			const walletData = await getWalletByUserId(session.user.id);
			if (walletData) {
				setWallet({
					points: walletData.points,
					lifetime_donations: walletData.lifetimeDonations,
				});
			}

			// Fetch claims
			const claimData = await getClaimsByUserId(session.user.id);
			setClaims(
				claimData.map((c) => ({
					id: c.id,
					type: c.type,
					status: c.status,
				})),
			);
		} catch (err) {
			console.error("Failed to fetch wallet data:", err);
		}
	}, [session?.user?.id]);

	useEffect(() => {
		if (!sessionLoading) {
			setLoading(true);
			fetchWallet().finally(() => setLoading(false));
		}
	}, [fetchWallet, sessionLoading]);

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
			await fetchWallet(); // Refresh data
		} catch (err) {
			console.error("Failed to create claim:", err);
			// Optional: show toast/error
		} finally {
			setRedeeming(null);
		}
	};

	const points = wallet?.points ?? 0;

	if (!session?.user) {
		return router.push("/auth/login");
	}

	return (
		<div className="space-y-8">
			{/* Wallet Header */}
			<div className="rounded-2xl bg-gradient-to-br from-rose-600 to-rose-500 p-6 text-white shadow-lg">
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
							{loading ? "—" : points}
						</p>
					</div>
					<div>
						<p className="text-xs text-rose-100">
							Lifetime Donations
						</p>
						<p className="text-2xl font-semibold">
							{loading ? "—" : (wallet?.lifetime_donations ?? 0)}
						</p>
					</div>
				</div>
				<p className="mt-4 max-w-md text-xs text-rose-100">
					Points are earned through verified donations and redeemed
					for non-cash health and wellness perks below.
				</p>
			</div>

			{/* Perks Grid */}
			<section>
				<h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
					<Award className="h-4 w-4 text-rose-600" />
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
		<div className="rounded-xl border border-gray-200 bg-white p-5">
			<div className="flex items-start justify-between">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50">
					<Icon className="h-5 w-5 text-rose-600" />
				</div>
				{!unlocked && <Lock className="h-4 w-4 text-gray-300" />}
				{unlocked && !redeemed && (
					<CheckCircle2 className="h-4 w-4 text-emerald-500" />
				)}
			</div>
			<h3 className="mt-3 text-sm font-semibold text-gray-900">
				{title}
			</h3>
			<p className="mt-1 text-xs text-gray-500">{description}</p>

			<div className="mt-4">
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
					<div
						className={`h-full rounded-full ${unlocked ? "bg-emerald-500" : "bg-rose-400"}`}
						style={{ width: `${progress}%` }}
					/>
				</div>
				<p className="mt-1.5 text-[11px] text-gray-400">
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
							? "bg-rose-600 text-white hover:bg-rose-700"
							: "bg-gray-100 text-gray-400"
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
