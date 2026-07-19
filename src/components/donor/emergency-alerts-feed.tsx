"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import type { EmergencyMatchRequest, DonorStatus } from "@/lib/donor-types";
import type { EligibilityResult } from "@/lib/eligibility";
import { AlertCard } from "@/components/donor/alert-card";
import { DeclinedAlertRow } from "@/components/donor/declined-alert-row";

interface EmergencyAlertsFeedProps {
	requests: EmergencyMatchRequest[];
	bloodType: string;
	eligibility: EligibilityResult;
	donorStatus: DonorStatus;
	donorAlertStatuses: Record<string, string>;
	activeTrackingId: string | null;
	onRespond: (reqId: string) => void;
	onDecline: (reqId: string) => void;
	onMarkEnRoute: (reqId: string) => void;
	onMarkArrived: (reqId: string) => void;
}

export function EmergencyAlertsFeed({
	requests,
	bloodType,
	eligibility,
	donorStatus,
	donorAlertStatuses,
	activeTrackingId,
	onRespond,
	onDecline,
	onMarkEnRoute,
	onMarkArrived,
}: EmergencyAlertsFeedProps) {
	const [collapsedDeclined, setCollapsedDeclined] = useState<
		Record<string, boolean>
	>({});

	const toggleDeclined = (id: string) => {
		setCollapsedDeclined((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center bg-card border-border rounded-xl p-6 shadow-sm transition-shadow hover:shadow-card-hover">
				<div>
					<h3 className="font-bold flex items-center gap-2 text-brand">
						<Bell className="h-5 w-5" />
						Urgent Emergency Match Feed
					</h3>
					<p className="text-xs text-muted-foreground mt-1">
						Matching compatible Blood Type:{" "}
						<strong className="text-brand font-mono">
							{bloodType}
						</strong>
					</p>
				</div>
				<span className="text-[10px] uppercase font-mono px-2.5 py-1 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded-full border border-green-200">
					LIVE
				</span>
			</div>

			<div className="space-y-4">
				{requests.length === 0 ? (
					<div className="bg-card border-border rounded-xl p-10 text-center text-muted-foreground">
						No active emergency alerts currently matching your
						criteria. Thank you for your availability!
					</div>
				) : (
					requests.map((req) => {
						const alertStatus = donorAlertStatuses[req.id];
						const isDeclined = alertStatus === "declined";
						const isApproved =
							alertStatus === "accepted" ||
							alertStatus === "en_route" ||
							alertStatus === "arrived" ||
							alertStatus === "completed";
						const isTrackingThis = activeTrackingId === req.id;
						const collapsed = collapsedDeclined[req.id];

						if (isDeclined && collapsed) {
							return (
								<DeclinedAlertRow
									key={req.id}
									request={req}
									onToggle={() => toggleDeclined(req.id)}
								/>
							);
						}

						return (
							<AlertCard
								key={req.id}
								request={req}
								alertStatus={alertStatus}
								isDeclined={isDeclined}
								isApproved={isApproved}
								isTrackingThis={isTrackingThis}
								eligibility={eligibility}
								donorStatus={donorStatus}
								onRespond={onRespond}
								onDecline={onDecline}
								onMarkEnRoute={onMarkEnRoute}
								onMarkArrived={onMarkArrived}
								onToggleCollapse={() => toggleDeclined(req.id)}
							/>
						);
					})
				)}
			</div>
		</div>
	);
}
