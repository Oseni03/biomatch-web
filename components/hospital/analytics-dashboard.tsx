import { Clock, Activity, Sparkles, BarChart, Download } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

const STATS = [
	{
		label: "Avg Response Speed",
		value: "8.7 mins",
		sub: "Request creation to first confirmation",
		color: "text-brand",
		icon: Clock,
	},
	{
		label: "Donor Alert Conversion",
		value: "68.2%",
		sub: "% alerts opened & matched",
		color: "text-green-600",
		icon: Activity,
	},
	{
		label: "Lagos Coverage Level",
		value: "92%",
		sub: "High demand blood types met",
		color: "text-blue-600",
		icon: Sparkles,
	},
];

const WEEKLY_DATA = [
	{ week: "Week 1", speed: 14.5, height: 40 },
	{ week: "Week 2", speed: 12.1, height: 50 },
	{ week: "Week 3", speed: 9.8, height: 68 },
	{ week: "Week 4", speed: 8.7, height: 85 },
];

export function AnalyticsDashboard() {
	return (
		<div className="space-y-8 animate-in fade-in duration-300">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{STATS.map((stat, i) => {
					const Icon = stat.icon;
					return (
						<Card
							key={i}
							className="bg-card border-border rounded-2xl p-6"
						>
							<div className="flex justify-between items-start mb-4">
								<span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
									{stat.label}
								</span>
								<Icon className={`h-5 w-5 ${stat.color}`} />
							</div>
							<h4
								className={`text-3xl font-bold font-mono tracking-tight ${stat.color}`}
							>
								{stat.value}
							</h4>
							<p className="text-xs text-muted-foreground mt-2 leading-relaxed">
								{stat.sub}
							</p>
						</Card>
					);
				})}
			</div>

			<Card className="bg-card border-border rounded-3xl p-6">
				<div className="flex justify-between items-center pb-4 border-b border-border mb-6">
					<div>
						<CardTitle className="text-base font-bold flex items-center gap-2">
							<BarChart className="h-5 w-5 text-brand" />
							Aggregate Response Performance Timeline
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground">
							Weekly average response time in minutes
						</CardDescription>
					</div>

					<button
						className="px-3.5 py-1.5 border-border hover:bg-muted text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
						onClick={() =>
							alert("Donation logs successfully exported as CSV!")
						}
					>
						<Download className="h-3.5 w-3.5" />
						Export Reports
					</button>
				</div>

				<div className="h-64 flex flex-col justify-end pt-4 font-mono text-[10px] text-muted-foreground">
					<div className="flex-1 w-full flex items-end justify-between px-6 gap-4 border-b border-border pb-2 relative">
						<div className="absolute left-0 bottom-10 w-full border-t border-border/50" />
						<div className="absolute left-0 bottom-24 w-full border-t border-border/50" />
						<div className="absolute left-0 bottom-44 w-full border-t border-border/50" />

						{WEEKLY_DATA.map((item, idx) => (
							<div
								key={idx}
								className="flex-1 flex flex-col items-center gap-2 group relative z-10"
							>
								<span className="font-bold text-brand text-[11px] group-hover:scale-110 transition-transform">
									{item.speed} min
								</span>
								<div
									className="w-12 bg-brand hover:bg-brand-hover rounded-t-lg transition-all duration-1000 ease-out"
									style={{ height: `${item.height}%` }}
								/>
								<span className="text-muted-foreground uppercase text-[9px] font-semibold mt-1">
									{item.week}
								</span>
							</div>
						))}
					</div>
				</div>
			</Card>
		</div>
	);
}
