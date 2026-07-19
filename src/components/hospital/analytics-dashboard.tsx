"use client";

import { useState } from "react";
import { Clock, Activity, Sparkles } from "lucide-react";
import { useHospitalAnalytics } from "@/hooks/use-analytics";
import { Card } from "@/components/ui/card";
import { exportDonationRecords } from "@/servers/analytics";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/hospital/date-range-picker";
import { RequestVolumeChart } from "@/components/hospital/request-volume-chart";
import { CoverageGapsCard } from "@/components/hospital/coverage-gaps-card";

interface AnalyticsDashboardProps {
	hospitalId: string;
}

export function AnalyticsDashboard({ hospitalId }: AnalyticsDashboardProps) {
	const today = new Date().toISOString().split("T")[0];
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];
	const [startDate, setStartDate] = useState(thirtyDaysAgo);
	const [endDate, setEndDate] = useState(today);

	const dateRange = { startDate, endDate };
	const { data: analytics, isLoading } = useHospitalAnalytics(
		hospitalId,
		dateRange,
	);

	const handleExport = async () => {
		try {
			const csv = await exportDonationRecords(hospitalId, dateRange);
			const blob = new Blob([csv], { type: "text/csv" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `donation-records-${today}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success("Donation records exported");
		} catch {
			toast.error("Failed to export records");
		}
	};

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="h-36 animate-pulse rounded-xl bg-muted"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-in fade-in duration-300">
			<DateRangePicker
				startDate={startDate}
				endDate={endDate}
				onStartDateChange={setStartDate}
				onEndDateChange={setEndDate}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="bg-card border-border rounded-xl p-6 transition-shadow hover:shadow-card-hover">
					<div className="flex justify-between items-start mb-4">
						<span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
							Avg Response Speed
						</span>
						<Clock className="h-5 w-5 text-brand" />
					</div>
					<h4 className="text-3xl font-bold font-mono tracking-tight text-brand">
						{analytics?.avgResponseTime ?? 0} min
					</h4>
					<p className="text-xs text-muted-foreground mt-2">
						Request creation to first acceptance
					</p>
				</Card>

				<Card className="bg-card border-border rounded-xl p-6 transition-shadow hover:shadow-card-hover">
					<div className="flex justify-between items-start mb-4">
						<span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
							Donor Alert Conversion
						</span>
						<Activity className="h-5 w-5 text-green-600" />
					</div>
					<h4 className="text-3xl font-bold font-mono tracking-tight text-green-600">
						{analytics?.responseRate ?? 0}%
					</h4>
					<p className="text-xs text-muted-foreground mt-2">
						Alerts accepted by donors
					</p>
				</Card>

				<Card className="bg-card border-border rounded-xl p-6 transition-shadow hover:shadow-card-hover">
					<div className="flex justify-between items-start mb-4">
						<span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
							Fulfillment Rate
						</span>
						<Sparkles className="h-5 w-5 text-blue-600" />
					</div>
					<h4 className="text-3xl font-bold font-mono tracking-tight text-blue-600">
						{analytics && analytics.totalRequests > 0
							? Math.round(
									(analytics.fulfilledRequests /
										analytics.totalRequests) *
										100,
								)
							: 0}
						%
					</h4>
					<p className="text-xs text-muted-foreground mt-2">
						Requests fully fulfilled
					</p>
				</Card>
			</div>

			<RequestVolumeChart
				monthlyVolume={analytics?.monthlyVolume ?? []}
				onExport={handleExport}
			/>

			{analytics && analytics.coverageGaps.length > 0 && (
				<CoverageGapsCard coverageGaps={analytics.coverageGaps} />
			)}
		</div>
	);
}
