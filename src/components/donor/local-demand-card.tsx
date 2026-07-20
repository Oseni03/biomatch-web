import { Activity } from "lucide-react";

interface LocalDemandCardProps {
	location: string;
	totalThisMonth: number;
	criticalThisMonth: number;
	completedCount: number;
}

export function LocalDemandCard({
	location,
	totalThisMonth,
	criticalThisMonth,
	completedCount,
}: LocalDemandCardProps) {
	const coveragePercent =
		totalThisMonth > 0
			? Math.round(
					(completedCount / Math.max(1, totalThisMonth)) * 100,
				)
			: 0;

	return (
		<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
			<div className="flex items-center gap-2 mb-4">
				<Activity className="h-4 w-4 text-purple-600" />
				<span className="text-sm font-semibold text-foreground">
					Local Demand — {location}
				</span>
			</div>
			<div className="flex gap-6">
				<div>
					<span className="text-lg font-bold font-mono text-foreground block">
						{totalThisMonth}
					</span>
					<span className="text-[10px] font-mono uppercase text-muted-foreground">
						Total emergencies
					</span>
				</div>
				<div>
					<span className="text-lg font-bold font-mono text-brand block">
						{criticalThisMonth}
					</span>
					<span className="text-[10px] font-mono uppercase text-muted-foreground">
						Critical
					</span>
				</div>
				<div>
					<span className="text-lg font-bold font-mono text-foreground block">
						{coveragePercent}%
					</span>
					<span className="text-[10px] font-mono uppercase text-muted-foreground">
						Your coverage
					</span>
				</div>
			</div>
		</div>
	);
}
