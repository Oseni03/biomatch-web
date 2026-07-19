"use client";

import {
	Activity,
	MapPin,
	Clock,
	Check,
	Navigation,
	LogIn,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EmergencyMatchRequest, DonorStatus } from "@/lib/donor-types";
import type { EligibilityResult } from "@/lib/eligibility";

interface AlertCardProps {
	request: EmergencyMatchRequest;
	alertStatus: string | undefined;
	isDeclined: boolean;
	isApproved: boolean;
	isTrackingThis: boolean;
	eligibility: EligibilityResult;
	donorStatus: DonorStatus;
	onRespond: (reqId: string) => void;
	onDecline: (reqId: string) => void;
	onMarkEnRoute: (reqId: string) => void;
	onMarkArrived: (reqId: string) => void;
	onToggleCollapse: () => void;
}

function donorActionLabel(
	status: string | undefined,
	isTrackingThis: boolean,
): string {
	if (isTrackingThis) return "In Transit";
	if (status === "arrived" || status === "completed") return "Fulfilled";
	if (status === "en_route") return "Mark Arrived";
	if (status === "accepted") return "Mark En Route";
	if (status === "declined") return "Declined";
	return "Pending Response";
}

export function AlertCard({
	request,
	alertStatus,
	isDeclined,
	isApproved,
	isTrackingThis,
	eligibility,
	donorStatus,
	onRespond,
	onDecline,
	onMarkEnRoute,
	onMarkArrived,
	onToggleCollapse,
}: AlertCardProps) {
	return (
		<div
			className={`bg-card border border-border rounded-xl p-6 transition-all duration-300 relative overflow-hidden hover:shadow-card-hover ${
				isApproved ? "border-green-300 dark:border-green-900/50" : ""
			} ${isDeclined ? "opacity-50" : ""}`}
		>
			<div className="absolute right-6 top-6 w-11 h-11 bg-brand-light border-brand/20 rounded-2xl flex items-center justify-center text-brand font-bold font-mono">
				{request.bloodType}
			</div>

			<div className="flex items-start gap-3 border-b border-border pb-4 mb-4">
				<Activity className="h-5 w-5 text-brand mt-0.5 flex-shrink-0" />
				<div>
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-bold text-base md:text-lg">
							{request.hospitalName}
						</span>
						{request.urgency === "critical" ? (
							<Badge className="bg-brand-light text-brand border-brand/20 font-mono text-[10px] tracking-wider animate-pulse">
								CRITICAL
							</Badge>
						) : (
							<Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 font-mono text-[10px] tracking-wider">
								HIGH
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 font-medium">
						<span className="flex items-center gap-1">
							<MapPin className="h-3.5 w-3.5" />
							{request.location}
						</span>
						<span className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							{new Date(request.timestamp).toLocaleTimeString(
								[],
								{ hour: "2-digit", minute: "2-digit" },
							)}
						</span>
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-3.5 mb-3.5">
				<div className="text-xs text-muted-foreground space-y-1 text-left">
					<div>
						Required:{" "}
						<strong className="text-foreground font-semibold">
							{request.requiredPints} Pints
						</strong>{" "}
						- Emergency Hotline:{" "}
						<span className="font-mono text-brand">
							{request.contactPhone}
						</span>
					</div>
					<div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground flex-wrap">
						<span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
							<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
							Push Notification: DELIVERED
						</span>
						<span>-</span>
						{request.urgency === "critical" ? (
							<span className="flex items-center gap-1 text-brand font-semibold">
								<span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
								SMS Fallback: SENT SIMULTANEOUSLY
							</span>
						) : (
							<span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
								<span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
								SMS Fallback: QUEUED FOR 2-MIN TIMEOUT
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="text-xs text-muted-foreground font-medium">
					Status:{" "}
					<span
						className={`font-bold uppercase ${
							isDeclined
								? "text-muted-foreground"
								: isApproved
									? "text-green-600"
									: "text-brand"
						}`}
					>
						{isDeclined
							? "Declined"
							: isApproved
								? donorActionLabel(alertStatus, isTrackingThis)
								: "Pending Response"}
					</span>
				</div>

				<div className="flex gap-2 w-full sm:w-auto">
					{isDeclined ? (
						<button
							onClick={onToggleCollapse}
							className="px-3 py-1.5 border-border text-muted-foreground hover:bg-muted transition"
						>
							Hide
						</button>
					) : isApproved ? (
						<>
							{alertStatus === "accepted" && (
								<button
									onClick={() => onMarkEnRoute(request.id)}
									disabled={isTrackingThis}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
								>
									<Navigation className="h-3.5 w-3.5" />
									Mark En Route
								</button>
							)}
							{alertStatus === "en_route" && (
								<button
									onClick={() => onMarkArrived(request.id)}
									disabled={isTrackingThis}
									className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
								>
									<LogIn className="h-3.5 w-3.5" />
									Mark Arrived
								</button>
							)}
							{(alertStatus === "arrived" ||
								alertStatus === "completed") && (
								<span className="px-4 py-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/40 rounded-2xl text-xs font-semibold flex items-center gap-1.5">
									<Check className="h-3.5 w-3.5" />
									Fulfilled
								</span>
							)}
						</>
					) : (
						<>
							<button
								onClick={() => onDecline(request.id)}
								className="px-4 py-2 border-border text-muted-foreground hover:text-brand hover:bg-muted rounded-lg transition"
							>
								Decline
							</button>
							<button
								onClick={() => onRespond(request.id)}
								disabled={
									!eligibility.eligible ||
									donorStatus !== "available"
								}
								className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
								title={
									!eligibility.eligible
										? "You must wait until deferral period is complete"
										: "Toggle Availability to Available"
								}
							>
								Accept and Depart
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
