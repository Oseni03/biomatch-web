"use client";

import { useState } from "react";
import {
	Bell,
	CheckCircle2,
	XCircle,
	MapPin,
	ArrowRight,
	Target,
	Clock,
	ChevronDown,
	ChevronUp,
	Expand,
} from "lucide-react";
import { displayBloodGroup } from "@/lib/donor-types";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import { useExpandSearchRadius } from "@/hooks/use-emergency-requests";
import type { getPendingEmergencyRequestsForOrganization } from "@/servers/emergency";

type PendingRequest = Awaited<
	ReturnType<typeof getPendingEmergencyRequestsForOrganization>
>["requests"][number];

interface LiveStatusPanelProps {
	request: PendingRequest;
}

const STATUS_CONFIG = [
	{
		key: "alerted" as const,
		label: "Alerted",
		icon: Bell,
		color: "text-muted-foreground",
		bg: "bg-muted",
		border: "border-border",
	},
	{
		key: "accepted" as const,
		label: "Accepted",
		icon: CheckCircle2,
		color: "text-status-ok",
		bg: "bg-status-ok-bg",
		border: "border-status-ok/20",
	},
	{
		key: "declined" as const,
		label: "Declined",
		icon: XCircle,
		color: "text-brand",
		bg: "bg-brand-light",
		border: "border-brand/20",
	},
	{
		key: "en_route" as const,
		label: "En Route",
		icon: MapPin,
		color: "text-status-info",
		bg: "bg-status-info-bg",
		border: "border-status-info/20",
	},
	{
		key: "arrived" as const,
		label: "Arrived",
		icon: Target,
		color: "text-status-low",
		bg: "bg-status-low-bg",
		border: "border-status-low/20",
	},
	{
		key: "completed" as const,
		label: "Completed",
		icon: Clock,
		color: "text-status-ok",
		bg: "bg-status-ok-bg",
		border: "border-status-ok/20",
	},
];

function timeAgo(date: Date | string): string {
	const then = new Date(date).getTime();
	const diffMs = Date.now() - then;
	const mins = Math.max(0, Math.round(diffMs / 60000));
	if (mins < 1) return "Just now";
	if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	const days = Math.round(hours / 24);
	return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function LiveStatusPanel({
	request,
}: LiveStatusPanelProps) {
	const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
	const [responsesOpen, setResponsesOpen] = useState(false);
	const expandRadius = useExpandSearchRadius();

	const bloodGroup = displayBloodGroup(request.bloodGroup);
	const totalDonors = request.alerts.length;
	const respondedCount =
		request.aggregates.accepted +
		request.aggregates.en_route +
		request.aggregates.arrived +
		request.aggregates.completed;
	const respondingAlerts = request.alerts.filter((a) =>
		["accepted", "en_route", "arrived", "completed"].includes(a.status),
	);

	return (
		<div className="bg-card border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-shadow hover:shadow-card-hover">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<BloodTypeBadge bloodGroup={request.bloodGroup} size="md" />
					<div>
						<h3 className="font-bold text-base sm:text-lg text-foreground">
							{bloodGroup} — {request.unitsNeeded} unit
							{request.unitsNeeded > 1 ? "s" : ""} Needed
						</h3>
						<p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
							{request.organization?.hospitalBanks[0]?.location && (
								<>
									<MapPin className="h-3 w-3" />
									{request.organization.hospitalBanks[0].location}
									<span>&bull;</span>
								</>
							)}
							<span>{timeAgo(request.createdAt)}</span>
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<StatusTag
						status={request.urgencyLevel === "critical" ? "critical" : "low"}
						pulse={request.urgencyLevel === "critical"}
					>
						{request.urgencyLevel === "critical" ? "Critical" : "Standard"}
					</StatusTag>
					<StatusTag status={respondedCount > 0 ? "ok" : "info"}>
						{respondedCount > 0 ? "Donors Responding" : "Notifying Donors"}
					</StatusTag>
				</div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 rounded-xl bg-muted/50 border border-border text-xs">
				<div>
					<div className="text-muted-foreground">Donors Notified</div>
					<div className="font-semibold text-foreground mt-0.5">
						{totalDonors} nearby
					</div>
				</div>
				<div>
					<div className="text-muted-foreground">Responses Received</div>
					<div className="font-semibold text-status-ok mt-0.5">
						{respondedCount}{" "}
						{respondedCount === 1 ? "donor responding" : "donors responding"}
					</div>
				</div>
				<div>
					<div className="text-muted-foreground">Time Created</div>
					<div className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
						<Clock className="h-3 w-3 text-muted-foreground" />
						{timeAgo(request.createdAt)}
					</div>
				</div>
				<div className="flex items-center justify-start sm:justify-end">
					<button
						type="button"
						onClick={() => setResponsesOpen((v) => !v)}
						className="text-xs font-medium text-brand hover:text-brand/80 flex items-center gap-1 transition-colors"
					>
						<span>{responsesOpen ? "Hide Donor Responses" : "Track Donor Responses"}</span>
						{responsesOpen ? (
							<ChevronUp className="h-3.5 w-3.5" />
						) : (
							<ChevronDown className="h-3.5 w-3.5" />
						)}
					</button>
				</div>
			</div>

			{responsesOpen && (
				<div className="pt-4 border-t border-border space-y-3">
					<div className="flex items-center justify-between">
						<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
							Responding Donors Coordination
						</h4>
						<span className="text-[11px] text-muted-foreground">
							Privacy Protected
						</span>
					</div>

					{respondingAlerts.length === 0 ? (
						<p className="py-4 text-center text-xs text-muted-foreground">
							Emergency alerts sent to {totalDonors} screened donor
							{totalDonors !== 1 ? "s" : ""}. Awaiting response replies.
						</p>
					) : (
						<div className="space-y-2">
							{respondingAlerts.map((a) => (
								<div
									key={a.id}
									className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border text-xs"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-status-ok-bg text-status-ok">
											<CheckCircle2 className="h-4 w-4" />
										</div>
										<div>
											<div className="font-semibold text-foreground flex items-center gap-2">
												<span>{a.donor.name ?? "Verified donor"}</span>
												<span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-light text-brand border border-brand/20">
													{displayBloodGroup(a.donor.bloodGroup)}
												</span>
											</div>
											<div className="text-[11px] text-muted-foreground mt-0.5">
												{a.donor.location ?? "Nearby"} &bull; Updated{" "}
												{timeAgo(a.updatedAt)}
											</div>
										</div>
									</div>
									<div className="text-right">
										<span className="inline-flex items-center gap-1 text-status-ok font-semibold capitalize">
											<span className="h-1.5 w-1.5 rounded-full bg-status-ok animate-pulse" />
											{a.status.replace(/_/g, " ")}
										</span>
									</div>
								</div>
							))}
						</div>
					)}

					<div className="flex justify-end pt-2">
						<Button
							variant="outline"
							size="sm"
							disabled={expandRadius.isPending}
							onClick={() =>
								expandRadius.mutate({ requestId: request.id })
							}
						>
							<Expand className="h-3.5 w-3.5" />
							{expandRadius.isPending ? "Expanding..." : "Expand Search Radius"}
						</Button>
					</div>
				</div>
			)}

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
				{STATUS_CONFIG.map((cfg) => {
					const Icon = cfg.icon;
					const count = request.aggregates[cfg.key];
					return (
						<button
							key={cfg.key}
							onClick={() =>
								setExpandedStatus(
									expandedStatus === cfg.key ? null : cfg.key,
								)
							}
							className={`${cfg.bg} ${cfg.border} border rounded-xl p-3 text-center transition cursor-pointer hover:shadow-sm ${
								expandedStatus === cfg.key
									? "ring-2 ring-offset-1 ring-brand"
									: ""
							}`}
						>
							<Icon
								className={`h-4 w-4 mx-auto mb-1 ${cfg.color}`}
							/>
							<span className="text-lg font-bold font-mono block text-foreground">
								{count}
							</span>
							<span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">
								{cfg.label}
							</span>
						</button>
					);
				})}
			</div>

			{expandedStatus && (
				<div className="border-t border-border pt-4">
					<p className="text-xs font-mono uppercase text-muted-foreground mb-2">
						{STATUS_CONFIG.find((s) => s.key === expandedStatus)?.label} Donors
					</p>
					<div className="space-y-2">
						{request.alerts
							.filter((a) => a.status === expandedStatus)
							.map((a) => (
								<div key={a.id} className="flex items-center justify-between text-sm">
									<span>{a.donor.name}</span>
									<span className="text-xs text-muted-foreground">
										{displayBloodGroup(a.donor.bloodGroup)}
									</span>
								</div>
							))}
						{request.alerts.filter((a) => a.status === expandedStatus).length === 0 && (
							<p className="text-xs text-muted-foreground">No donors in this stage</p>
						)}
					</div>
				</div>
			)}

			<div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
				<ArrowRight className="h-3 w-3" />
				<span>
					{totalDonors} donor{totalDonors !== 1 ? "s" : ""} alerted
					&mdash;{" "}
					{respondedCount} responded
					{request.searchRadius && (
						<> &bull; Radius: {request.searchRadius}km</>
					)}
				</span>
			</div>
		</div>
	);
}
