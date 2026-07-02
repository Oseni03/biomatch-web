import { Clock, MapPin, Check, CheckCircle2 } from "lucide-react";
import type { EmergencyMatchRequest } from "@/lib/donor-types";

export interface FunnelData {
	alerted: number;
	opened: number;
	accepted: number;
	progress: number;
	donorName: string;
	donorPhone: string;
	eta: number;
}

interface BroadcastStreamCardProps {
	request: EmergencyMatchRequest;
	funnel: FunnelData;
	onConfirmFulfillment: (reqId: string) => void;
}

export function BroadcastStreamCard({
	request: req,
	funnel,
	onConfirmFulfillment,
}: BroadcastStreamCardProps) {
	return (
		<div
			className={`bg-card border-border rounded-3xl p-6 shadow-sm transition-all duration-300 relative ${
				req.status === "completed" ? "opacity-75 border-border" : ""
			}`}
		>
			<div className="flex justify-between items-start mb-6">
				<div>
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-bold text-lg">
							{req.hospitalName}
						</span>
						<span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-brand-light text-brand rounded border-brand/20">
							Group {req.bloodType} Required
						</span>
					</div>
					<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
						<MapPin className="h-3 w-3" /> {req.location} &bull;
						Hotline: {req.contactPhone}
					</p>
				</div>

				<span className="text-xs font-mono text-muted-foreground">
					{new Date(req.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>

			{req.status !== "completed" && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted border-border rounded-2xl mb-6">
					<div className="text-center md:border-r border-border">
						<span className="text-[22px] font-bold font-mono text-foreground block">
							{funnel.alerted}
						</span>
						<span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">
							Donors Alerted
						</span>
					</div>
					<div className="text-center md:border-r border-border">
						<span className="text-[22px] font-bold font-mono text-orange-600 block">
							{funnel.opened}
						</span>
						<span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">
							Alerts Opened
						</span>
					</div>
					<div className="text-center md:border-r border-border">
						<span className="text-[22px] font-bold font-mono text-green-600 block">
							{funnel.accepted}
						</span>
						<span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">
							Matches Found
						</span>
					</div>
					<div className="text-center">
						<span className="text-xs font-mono font-bold text-brand block uppercase pt-2">
							{req.status === "matched"
								? "Transit Active"
								: "Searching..."}
						</span>
						<span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">
							Broadcaster status
						</span>
					</div>
				</div>
			)}

			{req.status === "matched" && funnel.donorName && (
				<div className="p-4 bg-green-50/50 dark:bg-green-950/10 border border-border rounded-2xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-xl flex items-center justify-center text-green-600">
							<Clock className="h-5 w-5 animate-spin" />
						</div>
						<div>
							<span className="text-[10px] font-mono uppercase text-green-600 font-semibold block">
								Donor En Route
							</span>
							<span className="font-bold text-sm text-foreground">
								{funnel.donorName} ({req.bloodType})
							</span>
							<span className="text-xs text-muted-foreground block font-medium">
								Phone: {funnel.donorPhone}
							</span>
						</div>
					</div>

					<div className="text-right w-full md:w-auto flex flex-col md:items-end gap-2">
						<span className="text-xs font-mono text-muted-foreground uppercase">
							Estimated Travel Time:{" "}
							<strong className="text-green-600 font-bold">
								{funnel.eta} mins
							</strong>
						</span>

						<button
							onClick={() => onConfirmFulfillment(req.id)}
							className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium text-xs rounded-xl shadow flex items-center gap-1.5"
						>
							<Check className="h-3.5 w-3.5" />
							Confirm Arrival & Log Donation
						</button>
					</div>
				</div>
			)}

			{req.status === "completed" && (
				<div className="p-4 bg-muted border-border rounded-2xl mb-2 flex items-center gap-3">
					<CheckCircle2 className="h-5 w-5 text-green-600" />
					<span className="text-xs text-muted-foreground font-medium">
						Fulfillment logged successfully. Donor reached hospital
						checkpoint and donation records updated.
					</span>
				</div>
			)}

			<div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-4">
				<span>
					Pints Requested:{" "}
					<strong className="text-foreground">
						{req.requiredPints}
					</strong>
				</span>
				<span
					className={`font-semibold uppercase ${
						req.status === "completed"
							? "text-green-600"
							: "text-brand animate-pulse"
					}`}
				>
					{req.status === "completed"
						? "Successfully Fulfilled"
						: "Active & Alerting"}
				</span>
			</div>
		</div>
	);
}
