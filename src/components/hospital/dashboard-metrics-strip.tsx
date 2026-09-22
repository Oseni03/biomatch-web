"use client";

import { Activity, CheckCircle2, Droplets, Hourglass } from "lucide-react";
import { useHospitalDashboardMetrics } from "@/hooks/use-hospital-dashboard";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";

export function DashboardMetricsStrip({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data, isLoading, isError, refetch } =
		useHospitalDashboardMetrics(organizationId);

	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCardSkeleton />
				<StatCardSkeleton />
				<StatCardSkeleton />
				<StatCardSkeleton />
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="rounded-2xl border border-border bg-card p-6 text-center">
				<p className="text-sm font-semibold text-foreground">
					Could not load dashboard metrics
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					Check your connection and try again.
				</p>
				<Button
					variant="outline"
					size="sm"
					className="mt-3 rounded-xl"
					onClick={() => refetch()}
				>
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<StatCard
				label="Active requests"
				value={String(data.activeRequests)}
				icon={Activity}
				tone={data.activeRequests > 0 ? "warning" : "default"}
			/>
			<StatCard
				label="Units still needed"
				value={String(data.unitsOutstanding)}
				icon={Hourglass}
				tone={data.unitsOutstanding > 0 ? "warning" : "default"}
			/>
			<StatCard
				label="Units accepted"
				value={String(data.unitsAccepted)}
				icon={CheckCircle2}
			/>
			<StatCard
				label="Completed donations"
				value={String(data.completedDonations)}
				icon={Droplets}
			/>
		</div>
	);
}
