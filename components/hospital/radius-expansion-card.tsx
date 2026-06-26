import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RadiusExpansionCardProps {
	hospitalLocation: string;
	alertRadius: number;
	autoExpandCountdown: number;
	isExpanding: boolean;
	onWidenRadius: () => void;
	maxRadius?: number;
}

export function RadiusExpansionCard({
	hospitalLocation,
	alertRadius,
	autoExpandCountdown,
	isExpanding,
	onWidenRadius,
	maxRadius = 15,
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
						Interactive Auto-Radius Expansion Engine
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
					<div className="text-right">
						<span className="text-[10px] font-mono text-gray-400 block uppercase">
							Next Expansion
						</span>
						<span className="text-sm font-mono font-bold text-red-600 dark:text-red-400 animate-pulse">
							In {autoExpandCountdown} seconds
						</span>
					</div>
					<button
						onClick={onWidenRadius}
						disabled={alertRadius >= maxRadius}
						className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-800 text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5"
					>
						Widen Radius Now (+2km)
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
					Scanning compatible blood types within {alertRadius}km...
				</span>
			</div>
		</Card>
	);
}
