import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

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
		<Card className="bg-card border-border rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-card-hover">
			<div className="flex items-center gap-2 mb-4">
				<Activity className="h-4 w-4 text-status-info" />
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
					<span className="text-lg font-bold font-mono text-status-critical block">
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
		</Card>
	);
}
