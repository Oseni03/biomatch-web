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
} from "lucide-react";
import { displayBloodGroup } from "@/lib/donor-types";
import type { getPendingEmergencyRequestsForOrganization } from "@/servers/emergency";
import { DonorStageList } from "@/components/hospital/donor-stage-list";

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

export function LiveStatusPanel({ request }: LiveStatusPanelProps) {
	const [expandedStatus, setExpandedStatus] = useState<string | null>(null);

	const bloodGroup = displayBloodGroup(request.bloodGroup);
	const totalDonors = request.alerts.length;

	return (
		<div className="bg-card border-border rounded-xl p-6 shadow-sm space-y-6 transition-shadow hover:shadow-card-hover">
			<div className="flex items-center justify-between flex-wrap gap-2">
				<div>
					<h3 className="font-bold text-lg text-foreground">
						{bloodGroup} — {request.unitsNeeded} unit
						{request.unitsNeeded > 1 ? "s" : ""}
					</h3>
					<p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
						{request.hospital.name}
						{request.hospital.location && (
							<>
								<span>&bull;</span>
								<MapPin className="h-3 w-3" />
								{request.hospital.location}
							</>
						)}
						<span>&bull;</span>
						<span className="capitalize">
							{request.urgencyLevel}
						</span>
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-brand-light text-brand rounded border-brand/20">
						{request.status}
					</span>
					<span className="text-xs text-muted-foreground font-mono">
						{new Date(request.createdAt).toLocaleDateString()}
					</span>
				</div>
			</div>

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
				<DonorStageList
					statusKey={expandedStatus}
					config={STATUS_CONFIG.find((s) => s.key === expandedStatus)}
					alerts={request.alerts}
					onClose={() => setExpandedStatus(null)}
				/>
			)}

			<div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
				<ArrowRight className="h-3 w-3" />
				<span>
					{totalDonors} donor{totalDonors !== 1 ? "s" : ""} alerted
					&mdash;{" "}
					{request.aggregates.accepted +
						request.aggregates.en_route +
						request.aggregates.arrived +
						request.aggregates.completed}{" "}
					responded
					{request.searchRadius && (
						<> &bull; Radius: {request.searchRadius}km</>
					)}
				</span>
			</div>
		</div>
	);
}
