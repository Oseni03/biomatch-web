"use client";

import Link from "next/link";
import {
	Droplet,
	HeartPulse,
	Wallet,
	CalendarClock,
	CheckCircle2,
	AlertCircle,
	ArrowRight,
	MapPin,
	Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getAllHospitalBanks } from "@/servers/hospital";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { getEligibility, ELIGIBILITY_DAYS } from "@/lib/eligibility";
import { toast } from "sonner";

const CRITICAL_THRESHOLD = 5;

export default function DonorDashboardPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();

	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useDonorDashboard();

	const { data: banks } = useQuery({
		queryKey: ["hospital-banks"],
		queryFn: () => getAllHospitalBanks(),
	});

	const profile = user
		? {
				full_name: user.name ?? "",
				blood_group: user.bloodGroup ?? null,
				genotype: user.genotype ?? null,
				last_donation_date: user.lastDonationDate
					? user.lastDonationDate.toISOString().slice(0, 10)
					: null,
			}
		: null;

	const walletData = user?.wallet
		? {
				points: user.wallet.points,
				lifetime_donations: user.wallet.lifetimeDonations,
			}
		: null;

	const criticalMatches = (banks ?? [])
		.filter((bank) => {
			const units = (bank.inventory as Record<string, number>)?.[
				user?.bloodGroup ?? ""
			] ?? 0;
			return units < CRITICAL_THRESHOLD;
		})
		.slice(0, 3)
		.map((bank) => ({
			hospital_name: bank.hospitalName,
			location: bank.location,
			units:
				(bank.inventory as Record<string, number>)?.[
					user?.bloodGroup ?? ""
				] ?? 0,
		}));

	const eligibility = getEligibility(profile?.last_donation_date ?? null);
	const profileComplete = Boolean(profile?.blood_group && profile?.genotype);

	if (userError) {
		toast.error("Failed to load dashboard data");
	}

	if (sessionLoading || userLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-gray-400" />
			</div>
		);
	}

	if (!session?.user) {
		return <p>Sign in to view the donor dashboard</p>;
	}

	return (
		<div className="space-y-8">
			<header>
				<h1 className="text-2xl font-bold text-gray-900">
					Welcome back
					{profile?.full_name
						? `, ${profile.full_name.split(" ")[0]}`
						: ""}
				</h1>
				<p className="mt-1 text-sm text-gray-500">
					Here&apos;s where things stand with your BioMatch account.
				</p>
			</header>

			<div className="grid gap-4 sm:grid-cols-3">
				<StatCard
					icon={Droplet}
					label="Blood Group"
					value={profile?.blood_group ?? "Not set"}
					tone={profile?.blood_group ? "default" : "warning"}
				/>
				<StatCard
					icon={Wallet}
					label="Loyalty Points"
					value={String(walletData?.points ?? 0)}
				/>
				<StatCard
					icon={HeartPulse}
					label="Lifetime Donations"
					value={String(walletData?.lifetime_donations ?? 0)}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
					<div className="flex items-center gap-2">
						<CalendarClock className="h-4.5 w-4.5 text-rose-600" />
						<h2 className="text-sm font-semibold text-gray-900">
							Donation Eligibility
						</h2>
					</div>

					{eligibility.eligible ? (
						<div className="mt-4 flex items-start gap-3 rounded-lg bg-emerald-50 p-4">
							<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
							<div>
								<p className="text-sm font-medium text-emerald-800">
									You&apos;re eligible to donate
								</p>
								<p className="mt-0.5 text-xs text-emerald-700">
									{eligibility.lastDonation
										? `Last donation was ${eligibility.daysSince} days ago, past the ${ELIGIBILITY_DAYS}-day minimum.`
										: "No prior donation on record — you're clear to give whenever you're ready."}
								</p>
							</div>
						</div>
					) : (
						<div className="mt-4 flex items-start gap-3 rounded-lg bg-amber-50 p-4">
							<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
							<div>
								<p className="text-sm font-medium text-amber-800">
									Eligible again in{" "}
									{eligibility.daysRemaining} day
									{eligibility.daysRemaining === 1 ? "" : "s"}
								</p>
								<p className="mt-0.5 text-xs text-amber-700">
									Donors need a {ELIGIBILITY_DAYS}-day gap
									between donations for safe recovery.
								</p>
							</div>
						</div>
					)}

					{!profileComplete && (
						<Link
							href="/donor/health-profile"
							className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-rose-300 hover:bg-rose-50/50"
						>
							<span>
								Complete your health profile to confirm match
								eligibility
							</span>
							<ArrowRight className="h-4 w-4" />
						</Link>
					)}
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-6">
					<div className="flex items-center gap-2">
						<Wallet className="h-4.5 w-4.5 text-rose-600" />
						<h2 className="text-sm font-semibold text-gray-900">
							Rewards
						</h2>
					</div>
					<p className="mt-3 text-3xl font-bold text-gray-900">
						{walletData?.points ?? 0}
					</p>
					<p className="text-xs text-gray-400">points available</p>
					<Link
						href="/donor/wallet"
						className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 py-2 text-sm font-medium text-white hover:bg-rose-700"
					>
						View Wallet & Perks
						<ArrowRight className="h-3.5 w-3.5" />
					</Link>
				</div>
			</div>

			{criticalMatches.length > 0 && (
				<section className="rounded-xl border border-red-200 bg-red-50 p-6">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-4.5 w-4.5 text-red-600" />
						<h2 className="text-sm font-semibold text-red-900">
							Your blood type ({profile?.blood_group}) is
							critically low nearby
						</h2>
					</div>
					<div className="mt-4 space-y-2">
						{criticalMatches.map((bank) => (
							<div
								key={bank.hospital_name}
								className="flex items-center justify-between rounded-lg bg-white px-4 py-3"
							>
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-gray-400" />
									<div>
										<p className="text-sm font-medium text-gray-900">
											{bank.hospital_name}
										</p>
										<p className="text-xs text-gray-400">
											{bank.location}
										</p>
									</div>
								</div>
								<span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
									{bank.units} units left
								</span>
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
