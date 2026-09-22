"use client";

import Link from "next/link";
import { Droplets } from "lucide-react";
import { useHospitalDashboardMetrics } from "@/hooks/use-hospital-dashboard";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { StatusTag } from "@/components/brand/status-tag";

const DONATION_TAG: Record<string, "ok" | "critical" | "info"> = {
	completed: "ok",
	cancelled: "critical",
	pending: "info",
};

export function RecentDonationsSection({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data, isLoading } = useHospitalDashboardMetrics(organizationId);
	const donations = data?.recentDonations ?? [];

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
					<Droplets className="h-4 w-4 text-muted-foreground" />
					Recent Donations
				</h2>
				<Link
					href="/hospital/history"
					className="text-xs font-medium text-brand hover:text-brand/80"
				>
					View All History →
				</Link>
			</div>

			{isLoading ? (
				<div className="bg-card border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
					Loading recent donations…
				</div>
			) : donations.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
					<Droplets className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-60" />
					<h3 className="text-base font-semibold text-foreground">
						No donations yet
					</h3>
					<p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
						Confirmed donations for this hospital will appear here with the
						donor, blood group and completion date.
					</p>
				</div>
			) : (
				<div className="bg-card border-border rounded-2xl divide-y divide-border overflow-hidden text-xs">
					{donations.map((donation) => (
						<div
							key={donation.id}
							className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
						>
							<div className="flex items-center gap-3">
								<BloodTypeBadge
									bloodGroup={donation.bloodGroup}
									size="sm"
								/>
								<div>
									<div className="font-semibold text-foreground">
										{donation.donorName}
									</div>
									<div className="text-muted-foreground text-[11px] mt-0.5">
										{(donation.completedAt ?? donation.createdAt)
											? new Date(
													donation.completedAt ?? donation.createdAt,
												).toLocaleDateString()
											: "Date pending"}
									</div>
								</div>
							</div>
							<StatusTag status={DONATION_TAG[donation.status] ?? "info"}>
								{donation.status}
							</StatusTag>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
