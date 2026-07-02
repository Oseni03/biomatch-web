"use client";

import { Navigation, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ActiveMissionTrackerProps {
	request: {
		id: string;
		hospitalName: string;
		location: string;
		requiredPints: number;
		bloodType: string;
	};
	trackingStatus: "accepted" | "en_route" | "arrived";
	trackingProgress: number;
	etaMinutes: number;
	donorLocation: string;
	onAbort: () => void;
	onSimulateArrival: () => void;
}

export function ActiveMissionTracker({
	request,
	trackingStatus,
	trackingProgress,
	etaMinutes,
	donorLocation,
	onAbort,
	onSimulateArrival,
}: ActiveMissionTrackerProps) {
	return (
		<Card className="border-brand/20 bg-brand-light rounded-3xl p-6 shadow-md relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
			<div className="absolute right-0 top-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-brand/10">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white relative animate-pulse">
						<Navigation className="h-6 w-6" />
					</div>
					<div>
						<Badge className="bg-brand hover:bg-brand-hover text-white font-mono text-[10px] uppercase font-semibold">
							Active Emergency Mission
						</Badge>
						<h3 className="font-bold text-lg mt-1">
							{request.hospitalName}
						</h3>
						<p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
							<MapPin className="h-3 w-3" /> {request.location}
						</p>
					</div>
				</div>

				<div className="text-right w-full md:w-auto">
					<span className="text-xs font-mono text-muted-foreground block uppercase">
						Estimated Arrival
					</span>
					<span className="text-3xl font-bold font-mono text-brand">
						{etaMinutes > 0 ? `${etaMinutes} mins` : "Arrived"}
					</span>
				</div>
			</div>

			<div className="py-6">
				<div className="flex justify-between items-center text-xs mb-2">
					<span className="font-mono text-muted-foreground uppercase">
						Transit Status:
					</span>
					<span className="font-semibold uppercase text-brand flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-brand animate-ping" />
						{trackingStatus === "accepted"
							? "Awaiting Departure"
							: trackingStatus === "en_route"
								? "En Route"
								: "Arrived and Checking In"}
					</span>
				</div>

				<div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
					<div
						className="absolute left-0 top-0 h-full bg-brand rounded-full transition-all duration-1000 ease-linear"
						style={{ width: `${trackingProgress}%` }}
					/>
				</div>

				<div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-2">
					<span>DEPARTED</span>
					<span>IN TRANSIT ({donorLocation.split(",")[0]})</span>
					<span>{request.hospitalName.substring(0, 15)}...</span>
				</div>
			</div>

			<div className="flex justify-between items-center pt-4 border-t border-red-100 dark:border-red-950 text-xs">
				<span className="text-muted-foreground">
					Requires{" "}
					<strong className="text-foreground font-semibold">
						{request.requiredPints} Pints ({request.bloodType})
					</strong>
				</span>
				<div className="flex gap-2">
					<button
						onClick={onAbort}
						className="px-4 py-2 border-brand/20 text-brand hover:bg-brand-light rounded-xl font-medium transition"
					>
						Abort Drive
					</button>
					<button
						onClick={onSimulateArrival}
						className="px-4 py-2 bg-brand text-white hover:bg-brand-hover rounded-xl font-medium transition"
					>
						Simulate Arrival
					</button>
				</div>
			</div>
		</Card>
	);
}
