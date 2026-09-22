"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, MapPin } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
	useAcceptMatch,
	useDeclineMatch,
	useMyResponses,
	useRequestsNearby,
	useWithdrawMatch,
} from "@/hooks/use-donor-requests";
import { useConfirmDonationDonor } from "@/hooks/use-donations";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";

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

export function DonorNearbyClient() {
	const { data: session } = authClient.useSession();
	const donorId = session?.user?.id;
	const [page, setPage] = useState(1);
	const { data, isLoading } = useRequestsNearby(donorId, { page, pageSize: 10 });
	const { data: responses } = useMyResponses(donorId);
	const accept = useAcceptMatch();
	const withdraw = useWithdrawMatch();
	const decline = useDeclineMatch();
	const confirm = useConfirmDonationDonor();
	const [error, setError] = useState<string | null>(null);

	const requests = data?.requests ?? [];
	const accepted = responses?.responses ?? [];
	const acting = accept.isPending || withdraw.isPending || decline.isPending || confirm.isPending;

	async function handleAccept(matchId: string) {
		if (!donorId) return;
		setError(null);
		try {
			await accept.mutateAsync({ matchId, donorId });
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not accept this request");
		}
	}

	async function handleWithdraw(matchId: string) {
		if (!donorId) return;
		setError(null);
		try {
			await withdraw.mutateAsync({ matchId, donorId });
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not withdraw");
		}
	}

	async function handleDecline(matchId: string) {
		if (!donorId) return;
		setError(null);
		try {
			await decline.mutateAsync({ matchId, donorId });
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not decline this request");
		}
	}

	async function handleConfirm(matchId: string) {
		if (!donorId) return;
		setError(null);
		try {
			await confirm.mutateAsync({ matchId, donorId });
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not confirm this donation");
		}
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Requests nearby"
				subtitle="Hospitals near you that need your blood type right now."
			/>

			{error && (
				<p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive">
					{error}
				</p>
			)}

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
											onClick={() => handleConfirm(response.matchId)}
										>
											{confirm.isPending ? "Confirming…" : "Confirm donation"}
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="rounded-xl"
											disabled={acting}
											onClick={() => handleWithdraw(response.matchId)}
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

			{isLoading ? (
				<div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
					Loading nearby requests…
				</div>
			) : requests.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
					<Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-3 text-sm font-semibold text-foreground">
						No requests nearby
					</p>
					<p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
						There are no open requests matching your blood type in your area
						right now. New alerts appear here and in your inbox as soon as a
						hospital needs you.
					</p>
					<Button asChild variant="outline" className="mt-4 rounded-2xl">
						<Link href="/donor/notifications">Check your inbox</Link>
					</Button>
				</div>
			) : (
				<ul className="space-y-3">
					{requests.map((request) => (
						<li
							key={request.matchId}
							className="rounded-2xl border border-brand/30 bg-brand-light/40 p-4"
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
										disabled={acting}
										onClick={() => handleDecline(request.matchId)}
									>
										{decline.isPending ? "Declining…" : "Decline"}
									</Button>
									<Button
										size="sm"
										className="rounded-xl"
										disabled={acting}
										onClick={() => handleAccept(request.matchId)}
									>
										{accept.isPending ? "Accepting…" : "Accept"}
									</Button>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}

			{(data?.totalPages ?? 1) > 1 && (
				<PaginationControls
					page={data!.page}
					totalPages={data!.totalPages}
					onPageChange={setPage}
					variant="numbered"
				/>
			)}
		</div>
	);
}
