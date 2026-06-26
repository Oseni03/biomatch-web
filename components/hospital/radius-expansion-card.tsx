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
		<Card className="bg-red-50/50 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
			<div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
				<div>
					<h4 className="font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
						<Activity
							className={`h-5 w-5 ${isExpanding ? "animate-spin" : "animate-pulse"}`}
						/>
						Expanding Search Radius
					</h4>
					<p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
						BioMatch is active. Current alert radius:{" "}
						<strong className="text-red-600 font-mono text-sm">
							{alertRadius} km
						</strong>{" "}
						around {hospitalLocation || "Lagos"}.
					</p>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-3">
						<div className="text-right">
							<span className="text-[10px] font-mono text-gray-400 block uppercase">
								Donors Alerted
							</span>
							<span className="text-sm font-mono font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
								<Users className="h-3.5 w-3.5" />
								{totalDonors}
							</span>
						</div>
						<div className="text-right">
							<span className="text-[10px] font-mono text-gray-400 block uppercase">
								Next Expansion
							</span>
							<span className="text-sm font-mono font-bold text-red-600 dark:text-red-400 animate-pulse">
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

			<div className="mt-4 flex justify-center items-center h-20 bg-gray-50 dark:bg-zinc-950 rounded-2xl relative overflow-hidden">
				<div
					className={`absolute border-2 border-red-500/30 rounded-full w-12 h-12 ${isExpanding ? "animate-ping scale-150 border-red-600" : "animate-pulse"}`}
				/>
				<div className="absolute border border-red-500/10 rounded-full w-24 h-24" />
				<div className="absolute border border-red-500/5 rounded-full w-36 h-36" />
				<span className="text-[10px] font-mono text-gray-400 tracking-wider relative uppercase bg-white/80 dark:bg-zinc-900/80 px-3 py-1 rounded-full border border-gray-150">
					{isExpanding
						? `Expanding to ${Math.min(alertRadius + 5, maxRadius)}km...`
						: `Scanning compatible donors within ${alertRadius}km...`}
				</span>
			</div>

			{totalDonors > 0 && (
				<div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
					<Users className="h-3.5 w-3.5 text-red-500" />
					<span>
						<strong className="text-gray-900 dark:text-white">
							{totalDonors}
						</strong>{" "}
						donors alerted within {alertRadius}km radius
					</span>
				</div>
			)}
		</Card>
	);
}
