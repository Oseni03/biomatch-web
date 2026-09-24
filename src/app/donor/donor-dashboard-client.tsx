"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Droplet, Loader2, MapPin } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import {
	useAcceptMatch,
	useDeclineMatch,
	useMyResponses,
	useRequestsNearby,
	useWithdrawMatch,
} from "@/hooks/use-donor-requests";
import { useConfirmDonationDonor } from "@/hooks/use-donations";
import { getEligibility } from "@/lib/eligibility";
import { displayBloodGroup } from "@/lib/donor-types";
import {
	formatNextEligibleDate,
	getGreeting,
	hasIncompleteProfile,
} from "@/lib/donor-dashboard";
import type { LegacyDonorSnapshot } from "@/lib/donor-types";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { EligibilitySection } from "@/components/donor/dashboard-eligibility";
import { ProfileIncompleteBanner } from "@/components/donor/profile-incomplete-banner";
import { WalkthroughGate } from "@/components/walkthrough/walkthrough-gate";
import { Button } from "@/components/ui/button";

function formatRelative(date: Date): string {
	const target = new Date(date);
	const diffMs = Date.now() - target.getTime();
	const minutes = Math.floor(diffMs / 60000);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	return target.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function DonorDashboardClient() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const donorId = session?.user?.id;
	const { data: user, isLoading: userLoading } = useDonorDashboard();
	const { data: nearby, isLoading: nearbyLoading } = useRequestsNearby(donorId, {
		page: 1,
		pageSize: 3,
	});
	const { data: responses } = useMyResponses(donorId);
	const accept = useAcceptMatch();
	const withdraw = useWithdrawMatch();
	const decline = useDeclineMatch();
	const confirm = useConfirmDonationDonor();
	const [error, setError] = useState<string | null>(null);

	if (sessionLoading || userLoading || nearbyLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return <p className="text-sm text-muted-foreground">Sign in to view your dashboard.</p>;
	}

	const u = user as LegacyDonorSnapshot | null | undefined;
	const lastDonatedAt = u?.donorProfile?.lastDonatedAt ?? u?.lastDonationDate ?? null;
	const eligibility = getEligibility(
		lastDonatedAt ? new Date(lastDonatedAt).toISOString().slice(0, 10) : null,
	);
	const nextEligibleLabel = lastDonatedAt ? formatNextEligibleDate(new Date(lastDonatedAt)) : null;
	const rawBloodGroup =
		u?.donorProfile?.bloodGroup ?? u?.bloodGroup ?? null;
	const bloodGroup = rawBloodGroup ? displayBloodGroup(rawBloodGroup) : "Not set";
	const incomplete = hasIncompleteProfile(user);

	const requests = nearby?.requests ?? [];
	const accepted = responses?.responses ?? [];
	const acting = accept.isPending || withdraw.isPending || decline.isPending || confirm.isPending;

	async function run(
		fn: () => Promise<unknown>,
		fallback: string,
	) {
		if (!donorId) return;
		setError(null);
		try {
			await fn();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : fallback);
		}
	}

	return (
		<div className="space-y-8">
			<WalkthroughGate audience="donor" />
			<DashboardGreeting
				title={`${getGreeting()}, ${session.user.name ?? "donor"}`}
				subtitle="You're on standby to save lives — hospitals will reach you when your blood type is needed."
				action={
					<Button asChild className="rounded-xl">
						<Link href="/donor/responses">View all requests</Link>
					</Button>
				}
			/>

			{error && (
				<p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive">
					{error}
				</p>
			)}

			{incomplete && <ProfileIncompleteBanner />}

			<EligibilitySection
				eligibility={eligibility}
				nextEligibleLabel={nextEligibleLabel}
				bloodGroup={bloodGroup}
				hasBloodGroup={rawBloodGroup !== null}
			/>

			{accepted.length > 0 && (
				<section className="space-y-3">
					<h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
						<CheckCircle2 className="h-4 w-4 text-emerald-600" />
						Your accepted donations ({accepted.length})
					</h2>
					<ul className="space-y-3">
						{accepted.map((response) => (
							<li
								key={response.matchId}
								className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4"
							>
								<div className="flex items-start gap-3">
									<BloodTypeBadge bloodGroup={response.bloodGroup} />
									<div className="min-w-0 flex-1">
										<p className="text-sm font-bold text-foreground">
											{response.bloodGroup} for {response.hospitalName}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											{response.locationName} · please visit the hospital to donate
										</p>
									</div>
									<div className="flex shrink-0 gap-2">
										<Button
											size="sm"
											className="rounded-xl"
											disabled={acting}
											onClick={() =>
												run(
													() => confirm.mutateAsync({ matchId: response.matchId, donorId: donorId! }),
													"Could not confirm this donation",
												)
											}
										>
											{confirm.isPending ? "Confirming…" : "Confirm donation"}
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="rounded-xl"
											disabled={acting}
											onClick={() =>
												run(
													() => withdraw.mutateAsync({ matchId: response.matchId, donorId: donorId! }),
													"Could not withdraw",
												)
											}
										>
											{withdraw.isPending ? "Withdrawing…" : "Withdraw"}
										</Button>
									</div>
								</div>
							</li>
						))}
					</ul>
				</section>
			)}

			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
						<Droplet className="h-4 w-4 text-brand" />
						Urgent requests near you
					</h2>
					{requests.length > 0 && (
						<Button asChild variant="ghost" size="sm" className="rounded-xl text-xs">
							<Link href="/donor/responses">View all</Link>
						</Button>
					)}
				</div>

				{requests.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
						<Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
						<p className="mt-3 text-sm font-semibold text-foreground">
							No urgent requests right now
						</p>
						<p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
							There are no open requests matching your blood type in your area.
							New alerts appear here and in your inbox as soon as a hospital
							needs you.
						</p>
						<Button asChild variant="outline" className="mt-4 rounded-2xl">
							<Link href="/donor/notifications">Check your inbox</Link>
						</Button>
					</div>
				) : (
					<ul className="space-y-3">
						{requests.map((request, index) => (
							<li
								key={request.matchId}
								className={
									index === 0
										? "rounded-2xl border-2 border-brand/50 bg-brand-light/40 p-5 shadow-card"
										: "rounded-2xl border border-brand/30 bg-brand-light/40 p-4"
								}
							>
								<div className="flex items-start gap-3">
									<BloodTypeBadge bloodGroup={request.bloodGroup} />
									<div className="min-w-0 flex-1">
										<p className="text-sm font-bold text-foreground">
											{request.bloodGroup} needed at {request.hospitalName}
										</p>
										<p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
											<MapPin className="h-3 w-3 shrink-0" />
											<span className="truncate">
												{request.locationName} · {request.distanceKm.toFixed(1)} km away
											</span>
										</p>
										<p className="mt-1 text-[11px] text-muted-foreground">
											{request.unitsRequired} unit{request.unitsRequired === 1 ? "" : "s"}{" "}
											needed · alerted {formatRelative(request.notifiedAt)}
										</p>
									</div>
									<div className="flex shrink-0 gap-2">
										<Button
											size="sm"
											variant="outline"
											className="rounded-xl"
											disabled={acting || !eligibility.eligible}
											onClick={() =>
												run(
													() => decline.mutateAsync({ matchId: request.matchId, donorId: donorId! }),
													"Could not decline this request",
												)
											}
										>
											{decline.isPending ? "Declining…" : "Decline"}
										</Button>
										<Button
											size="sm"
											className="rounded-xl"
											disabled={acting || !eligibility.eligible}
											onClick={() =>
												run(
													() => accept.mutateAsync({ matchId: request.matchId, donorId: donorId! }),
													"Could not accept this request",
												)
											}
										>
											{accept.isPending ? "Accepting…" : "I can help"}
										</Button>
									</div>
								</div>
								{!eligibility.eligible && (
									<p className="mt-2 text-[11px] font-medium text-status-low">
										You are in a deferral window — actions unlock {nextEligibleLabel ?? "when eligible"}.
									</p>
								)}
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
