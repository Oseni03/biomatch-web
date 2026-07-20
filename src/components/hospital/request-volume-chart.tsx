import { BarChart, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MonthlyVolumePoint {
	month: string;
	count: number;
}

interface RequestVolumeChartProps {
	monthlyVolume: MonthlyVolumePoint[];
	onExport: () => void;
}

export function RequestVolumeChart({
	monthlyVolume,
	onExport,
}: RequestVolumeChartProps) {
	return (
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
				<Button variant="outline" size="sm" onClick={onExport}>
					<Download className="h-3.5 w-3.5" />
					Export CSV
				</Button>
			</div>

			<div className="h-64 flex flex-col justify-end pt-4 font-mono text-[10px] text-muted-foreground">
				{monthlyVolume.length > 0 ? (
					<div className="flex-1 w-full flex items-end justify-between px-6 gap-4 border-b border-border pb-2 relative">
						{monthlyVolume.map((item, idx) => {
							const maxCount = Math.max(
								...monthlyVolume.map((m) => m.count),
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
	);
}
