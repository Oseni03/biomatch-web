"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { useEmergencyHistory } from "@/hooks/use-emergency-requests";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { StatusTag } from "@/components/brand/status-tag";

const HISTORY_TAG: Record<string, "ok" | "critical" | "info"> = {
	fulfilled: "ok",
	expired: "critical",
	cancelled: "info",
};

export function RecentActivitySection({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data, isLoading } = useEmergencyHistory(organizationId, {
		page: 1,
		pageSize: 3,
	});
	const requests = data?.requests ?? [];

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
					<History className="h-4 w-4 text-muted-foreground" />
					Recent Request Activity
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
					Loading recent activity…
				</div>
			) : requests.length === 0 ? (
				<div className="bg-card border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
					Fulfilled requests will appear here once donations are confirmed.
				</div>
			) : (
				<div className="bg-card border-border rounded-2xl divide-y divide-border overflow-hidden text-xs">
					{requests.map((item) => (
						<div
							key={item.id}
							className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
						>
							<div className="flex items-center gap-3">
								<BloodTypeBadge
									bloodGroup={item.bloodGroup}
									size="sm"
								/>
								<div>
									<div className="font-semibold text-foreground">
										{item.unitsNeeded} unit
										{item.unitsNeeded !== 1 ? "s" : ""} &bull;{" "}
										<span className="text-muted-foreground font-normal">
											{new Date(item.createdAt).toLocaleDateString()}
										</span>
									</div>
									<div className="text-muted-foreground text-[11px] mt-0.5">
										{item.alerts.length} donor
										{item.alerts.length !== 1 ? "s" : ""} alerted &bull;{" "}
										{item.aggregates.completed} completed
									</div>
								</div>
							</div>
							<StatusTag status={HISTORY_TAG[item.status] ?? "info"}>
								{item.status}
							</StatusTag>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
