import { Activity, Users, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MAX_RADIUS } from "@/lib/radius-expansion";

interface RadiusExpansionCardProps {
	hospitalLocation: string;
	alertRadius: number;
	autoExpandCountdown: number;
	isExpanding: boolean;
	totalDonors: number;
	onWidenRadius: () => void;
	maxRadius?: number;
	requestId: string;
}

export function RadiusExpansionCard({
	hospitalLocation,
	alertRadius,
	autoExpandCountdown,
	isExpanding,
	totalDonors,
	onWidenRadius,
	maxRadius = MAX_RADIUS,
	requestId: _requestId,
}: RadiusExpansionCardProps) {
	return (
		<Card className="bg-brand-light/50 border-brand/20 rounded-3xl p-6 shadow-sm relative overflow-hidden">
			<div className="absolute right-0 top-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
				<div>
					<h4 className="font-bold flex items-center gap-2 text-brand">
						<Activity
							className={`h-5 w-5 ${isExpanding ? "animate-spin" : "animate-pulse"}`}
						/>
						Expanding Search Radius
					</h4>
					<p className="text-xs text-muted-foreground mt-1">
						BioMatch is active. Current alert radius:{" "}
						<strong className="text-brand font-mono text-sm">
							{alertRadius} km
						</strong>{" "}
						around {hospitalLocation || "Lagos"}.
					</p>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-3">
						<div className="text-right">
							<span className="text-[10px] font-mono text-muted-foreground block uppercase">
								Donors Alerted
							</span>
							<span className="text-sm font-mono font-bold text-brand flex items-center gap-1">
								<Users className="h-3.5 w-3.5" />
								{totalDonors}
							</span>
						</div>
						<div className="text-right">
							<span className="text-[10px] font-mono text-muted-foreground block uppercase">
								Next Expansion
							</span>
							<span className="text-sm font-mono font-bold text-brand animate-pulse">
								In {autoExpandCountdown}s
							</span>
						</div>
					</div>
					<button
						onClick={onWidenRadius}
						disabled={alertRadius >= maxRadius}
						className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-800 text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-40"
					>
						<MapPin className="h-3.5 w-3.5" />
						Expand Now
					</button>
				</div>
			</div>

			<div className="mt-4 flex justify-center items-center h-20 bg-muted rounded-2xl relative overflow-hidden">
				<div
					className={`absolute border-2 border-brand/30 rounded-full w-12 h-12 ${isExpanding ? "animate-ping scale-150 border-brand" : "animate-pulse"}`}
				/>
				<div className="absolute border border-brand/10 rounded-full w-24 h-24" />
				<div className="absolute border border-brand/5 rounded-full w-36 h-36" />
				<span className="text-[10px] font-mono text-muted-foreground tracking-wider relative uppercase bg-card/80 px-3 py-1 rounded-full border-border">
					{isExpanding
						? `Expanding to ${Math.min(alertRadius + 5, maxRadius)}km...`
						: `Scanning compatible donors within ${alertRadius}km...`}
				</span>
			</div>

			{totalDonors > 0 && (
				<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
					<Users className="h-3.5 w-3.5 text-brand" />
					<span>
						<strong className="text-foreground">
							{totalDonors}
						</strong>{" "}
						donors alerted within {alertRadius}km radius
					</span>
				</div>
			)}
		</Card>
	);
}
