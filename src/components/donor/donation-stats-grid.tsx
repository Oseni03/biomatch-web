import { Droplets, Award, Heart, Activity } from "lucide-react";

interface DonationStatsGridProps {
	completedCount: number;
	points: number;
	livesImpacted: number;
	emergenciesThisMonth: number;
	demandLoading: boolean;
}

export function DonationStatsGrid({
	completedCount,
	points,
	livesImpacted,
	emergenciesThisMonth,
	demandLoading,
}: DonationStatsGridProps) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-brand-light dark:bg-red-950 rounded-xl flex items-center justify-center">
						<Droplets className="h-5 w-5 text-brand" />
					</div>
				</div>
				<span className="text-2xl font-bold font-mono text-foreground block">
					{completedCount}
				</span>
				<span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
					Total Donations
				</span>
			</div>

			<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
						<Award className="h-5 w-5 text-blue-600" />
					</div>
				</div>
				<span className="text-2xl font-bold font-mono text-foreground block">
					{points}
				</span>
				<span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
					Total Points
				</span>
			</div>

			<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-green-50 dark:bg-green-950 rounded-xl flex items-center justify-center">
						<Heart className="h-5 w-5 text-green-600" />
					</div>
				</div>
				<span className="text-2xl font-bold font-mono text-foreground block">
					{livesImpacted}
				</span>
				<span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
					Lives Impacted
				</span>
			</div>

			<div className="bg-white dark:bg-card border border-border dark:border-border rounded-2xl p-5 shadow-sm">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center">
						<Activity className="h-5 w-5 text-purple-600" />
					</div>
				</div>
				<span className="text-2xl font-bold font-mono text-foreground block">
					{demandLoading ? "..." : emergenciesThisMonth}
				</span>
				<span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
					Emergencies This Month
				</span>
			</div>
		</div>
	);
}
