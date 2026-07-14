"use client";

import { useState } from "react";
import { Clock, Activity, Sparkles, BarChart, Download } from "lucide-react";
import { useHospitalAnalytics } from "@/hooks/use-analytics";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { exportDonationRecords } from "@/servers/analytics";
import { toast } from "sonner";

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
			<div className="flex items-center gap-4 flex-wrap">
				<div className="flex items-center gap-2">
					<label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
						From
					</label>
					<input
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="px-3 py-1.5 bg-muted border border-border rounded-xl text-xs font-medium"
					/>
				</div>
				<div className="flex items-center gap-2">
					<label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
						To
					</label>
					<input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="px-3 py-1.5 bg-muted border border-border rounded-xl text-xs font-medium"
					/>
				</div>
			</div>

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

			<Card className="bg-card border-border rounded-xl p-6 transition-shadow hover:shadow-card-hover">
				<div className="flex justify-between items-center pb-4 border-b border-border mb-6">
					<div>
						<CardTitle className="text-base font-bold flex items-center gap-2">
							<BarChart className="h-5 w-5 text-brand" />
							Request Volume Over Time
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground">
							Monthly emergency request volume
						</CardDescription>
					</div>
					<button
						onClick={handleExport}
						className="px-3.5 py-1.5 border-border hover:bg-muted text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
					>
						<Download className="h-3.5 w-3.5" />
						Export CSV
					</button>
				</div>

				<div className="h-64 flex flex-col justify-end pt-4 font-mono text-[10px] text-muted-foreground">
					{analytics && analytics.monthlyVolume.length > 0 ? (
						<div className="flex-1 w-full flex items-end justify-between px-6 gap-4 border-b border-border pb-2 relative">
							{analytics.monthlyVolume.map((item, idx) => {
								const maxCount = Math.max(
									...analytics.monthlyVolume.map(
										(m) => m.count,
									),
									1,
								);
								const height = (item.count / maxCount) * 100;
								return (
									<div
										key={idx}
										className="flex-1 flex flex-col items-center gap-2 group relative z-10"
									>
										<span className="font-bold text-brand text-[11px] group-hover:scale-110 transition-transform">
											{item.count}
										</span>
										<div
											className="w-12 bg-brand hover:bg-brand-hover rounded-t-lg transition-all duration-1000 ease-out"
											style={{ height: `${height}%` }}
										/>
										<span className="text-muted-foreground uppercase text-[9px] font-semibold mt-1">
											{item.month.slice(5)}
										</span>
									</div>
								);
							})}
						</div>
					) : (
						<div className="flex-1 flex items-center justify-center text-muted-foreground">
							No request data available yet
						</div>
					)}
				</div>
			</Card>

			{analytics && analytics.coverageGaps.length > 0 && (
				<Card className="bg-card border-border rounded-xl p-6 transition-shadow hover:shadow-card-hover">
					<CardHeader className="p-0 pb-4 border-b border-border mb-6">
						<CardTitle className="text-base font-bold">
							Coverage Gaps
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground">
							Blood groups with unfulfilled requests
						</CardDescription>
					</CardHeader>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{analytics.coverageGaps.map((gap) => (
							<div
								key={gap.group}
								className="bg-brand-light rounded-xl p-4 text-center"
							>
								<span className="text-xl font-bold font-mono text-brand block">
									{gap.group.replace("_", " ")}
								</span>
								<span className="text-xs text-muted-foreground">
									{gap.count} unfulfilled
								</span>
							</div>
						))}
					</div>
				</Card>
			)}
		</div>
	);
}
