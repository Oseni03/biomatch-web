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
	donorLocation: string;
	onAbort: () => void;
	onSimulateArrival: () => void;
}

export function ActiveMissionTracker({
	request,
	trackingStatus,
	donorLocation,
	onAbort,
	onSimulateArrival,
}: ActiveMissionTrackerProps) {
	const statusLabel =
		trackingStatus === "accepted"
			? "Awaiting Departure"
			: trackingStatus === "en_route"
				? "En Route"
				: "Arrived and Checking In";

	return (
		<Card className="border-brand/20 bg-brand-light rounded-3xl p-6 shadow-md relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
			<div className="absolute right-0 top-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-brand/10">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white relative">
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
						Status
					</span>
					<span className="text-xl font-bold font-mono text-brand">
						{statusLabel}
					</span>
				</div>
			</div>

			<div className="flex justify-between items-center pt-4 text-xs">
				<span className="text-muted-foreground">
					Requires{" "}
					<strong className="text-foreground font-semibold">
						{request.requiredPints} Pints ({request.bloodType})
					</strong>
					<span className="ml-2 text-muted-foreground">
						&middot; From {donorLocation.split(",")[0]}
					</span>
				</span>
				<div className="flex gap-2">
					<button
						onClick={onAbort}
						className="px-4 py-2 border-brand/20 text-brand hover:bg-brand-light rounded-xl font-medium transition"
					>
						Abort Drive
					</button>
					{trackingStatus !== "arrived" && (
						<button
							onClick={onSimulateArrival}
							className="px-4 py-2 bg-brand text-white hover:bg-brand-hover rounded-xl font-medium transition"
						>
							{trackingStatus === "accepted"
								? "Mark En Route"
								: "Mark Arrived"}
						</button>
					)}
				</div>
			</div>
		</Card>
	);
}
