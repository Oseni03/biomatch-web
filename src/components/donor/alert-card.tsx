"use client";

import {
	Activity,
	MapPin,
	Clock,
	Check,
	Navigation,
	LogIn,
} from "lucide-react";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
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
				isApproved ? "border-status-ok/40" : ""
			} ${isDeclined ? "opacity-50" : ""}`}
		>
			<BloodTypeBadge
				bloodGroup={request.bloodType}
				size="md"
				className="absolute right-6 top-6"
			/>

			<div className="flex items-start gap-3 border-b border-border pb-4 mb-4">
				<Activity className="h-5 w-5 text-brand mt-0.5 flex-shrink-0" />
				<div>
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-bold text-base md:text-lg">
							{request.hospitalName}
						</span>
						{request.urgency === "critical" ? (
							<StatusTag status="critical" pulse>
								Critical
							</StatusTag>
						) : (
							<StatusTag status="low">High</StatusTag>
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
						<span className="flex items-center gap-1 text-status-ok font-semibold">
							<span className="w-1.5 h-1.5 rounded-full bg-status-ok animate-pulse" />
							Push Notification: DELIVERED
						</span>
						<span>-</span>
						{request.urgency === "critical" ? (
							<span className="flex items-center gap-1 text-status-critical font-semibold">
								<span className="w-1.5 h-1.5 rounded-full bg-status-critical animate-pulse" />
								SMS Fallback: SENT SIMULTANEOUSLY
							</span>
						) : (
							<span className="flex items-center gap-1 text-status-low font-semibold">
								<span className="w-1.5 h-1.5 rounded-full bg-status-low animate-pulse" />
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
									? "text-status-ok"
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
						<Button
							variant="outline"
							size="sm"
							onClick={onToggleCollapse}
						>
							Hide
						</Button>
					) : isApproved ? (
						<>
							{alertStatus === "accepted" && (
								<Button
									size="sm"
									onClick={() => onMarkEnRoute(request.id)}
									disabled={isTrackingThis}
									className="bg-status-info text-white hover:bg-status-info hover:opacity-90 hover:scale-100"
								>
									<Navigation className="h-3.5 w-3.5" />
									Mark En Route
								</Button>
							)}
							{alertStatus === "en_route" && (
								<Button
									size="sm"
									onClick={() => onMarkArrived(request.id)}
									disabled={isTrackingThis}
									className="bg-status-ok text-white hover:bg-status-ok hover:opacity-90 hover:scale-100"
								>
									<LogIn className="h-3.5 w-3.5" />
									Mark Arrived
								</Button>
							)}
							{(alertStatus === "arrived" ||
								alertStatus === "completed") && (
								<span className="px-4 py-2 bg-status-ok-bg text-status-ok border border-status-ok/20 rounded-2xl text-xs font-semibold flex items-center gap-1.5">
									<Check className="h-3.5 w-3.5" />
									Fulfilled
								</span>
							)}
						</>
					) : (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onDecline(request.id)}
								className="text-muted-foreground hover:text-brand"
							>
								Decline
							</Button>
							<Button
								size="sm"
								onClick={() => onRespond(request.id)}
								disabled={
									!eligibility.eligible ||
									donorStatus !== "available"
								}
								title={
									!eligibility.eligible
										? "You must wait until deferral period is complete"
										: "Toggle Availability to Available"
								}
							>
								Accept and Depart
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
