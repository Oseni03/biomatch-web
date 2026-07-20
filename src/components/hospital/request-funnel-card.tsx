import {
	ChevronDown,
	ChevronUp,
	Calendar,
	AlertTriangle,
} from "lucide-react";
import { displayBloodGroup } from "@/lib/donor-types";
import { StatusTag } from "@/components/brand/status-tag";

const STATUS_BADGE: Record<
	string,
	{ label: string; status: "ok" | "critical" | "info" }
> = {
	fulfilled: { label: "Fulfilled", status: "ok" },
	expired: { label: "Expired", status: "critical" },
	cancelled: { label: "Cancelled", status: "info" },
};

const FUNNEL_LABELS = [
	{ key: "alerted" as const, label: "Alerted" },
	{ key: "accepted" as const, label: "Accepted" },
	{ key: "en_route" as const, label: "En Route" },
	{ key: "arrived" as const, label: "Arrived" },
	{ key: "completed" as const, label: "Completed" },
];

export interface RequestFunnelRecord {
	id: string;
	status: string;
	bloodGroup: string;
	unitsNeeded: number;
	createdAt: Date;
	aggregates: {
		alerted: number;
		accepted: number;
		en_route: number;
		arrived: number;
		completed: number;
	};
	alerts: {
		id: string;
		status: string;
		donor: { name: string | null; bloodGroup: string | null };
	}[];
}

interface RequestFunnelCardProps {
	request: RequestFunnelRecord;
	isExpanded: boolean;
	onToggle: () => void;
}

export function RequestFunnelCard({
	request: req,
	isExpanded,
	onToggle,
}: RequestFunnelCardProps) {
	const badge = STATUS_BADGE[req.status] ?? {
		label: req.status,
		status: "info" as const,
	};
	const shortfallStages = FUNNEL_LABELS.filter(
		(f) => req.aggregates[f.key] === 0,
	);

	return (
		<div className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
			<button
				onClick={onToggle}
				className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted transition text-left"
			>
				<div className="flex items-center gap-4 flex-wrap">
					<div className="flex items-center gap-2">
						<span className="font-bold text-foreground">
							{displayBloodGroup(req.bloodGroup)}
						</span>
						<span className="text-xs text-muted-foreground">
							{req.unitsNeeded} unit
							{req.unitsNeeded > 1 ? "s" : ""}
						</span>
					</div>
					<StatusTag status={badge.status}>{badge.label}</StatusTag>
					{req.aggregates.alerted === 0 && req.status === "expired" && (
						<span className="text-[10px] font-mono text-brand flex items-center gap-1">
							<AlertTriangle className="h-3 w-3" />
							No donors found
						</span>
					)}
					{req.aggregates.accepted === 0 &&
						req.aggregates.alerted > 0 &&
						req.status === "expired" && (
							<span className="text-[10px] font-mono text-status-low flex items-center gap-1">
								<AlertTriangle className="h-3 w-3" />
								No donors accepted
							</span>
						)}
				</div>
				<div className="flex items-center gap-3">
					<span className="text-xs text-muted-foreground font-mono hidden sm:inline">
						{new Date(req.createdAt).toLocaleDateString()}
					</span>
					{isExpanded ? (
						<ChevronUp className="h-4 w-4 text-muted-foreground" />
					) : (
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					)}
				</div>
			</button>

			{isExpanded && (
				<div className="px-5 pb-4 space-y-4 border-t border-border pt-4">
					<div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
						{FUNNEL_LABELS.map((f) => {
							const count = req.aggregates[f.key];
							const isZero = count === 0;
							return (
								<div
									key={f.key}
									className={`p-2 rounded-xl text-center border ${
										isZero
											? "border-brand/20 bg-brand-light"
											: "border-status-ok/20 bg-status-ok-bg"
									}`}
								>
									<span
										className={`text-lg font-bold font-mono block ${
											isZero ? "text-brand" : "text-status-ok"
										}`}
									>
										{count}
									</span>
									<span className="text-[8px] font-mono uppercase text-muted-foreground tracking-wider">
										{f.label}
									</span>
								</div>
							);
						})}
					</div>

					{shortfallStages.length > 0 && req.status === "expired" && (
						<div className="p-3 bg-status-low-bg border border-status-low/20 rounded-xl text-xs text-status-low flex items-start gap-2">
							<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
							<span>
								Shortfall detected at:{" "}
								<strong>
									{shortfallStages
										.map((f) => f.label)
										.join(", ")}
								</strong>
								. Request expired without full fulfillment.
							</span>
						</div>
					)}

					{req.alerts.length > 0 && (
						<div>
							<p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
								All Donors
							</p>
							<div className="divide-y divide-border">
								{req.alerts.map((alert) => (
									<div
										key={alert.id}
										className="py-2 flex items-center justify-between"
									>
										<span className="text-sm text-foreground">
											{alert.donor.name ?? "Unknown"}
										</span>
										<span className="text-xs text-muted-foreground">
											{displayBloodGroup(
												alert.donor.bloodGroup,
											)}{" "}
											&bull;{" "}
											<span className="capitalize">
												{alert.status.replace(
													/_/g,
													" ",
												)}
											</span>
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
