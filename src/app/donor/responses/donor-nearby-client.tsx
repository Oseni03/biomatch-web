"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRequestsNearby } from "@/hooks/use-donor-requests";
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

	const requests = data?.requests ?? [];

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Requests nearby"
				subtitle="Hospitals near you that need your blood type right now."
			/>

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
