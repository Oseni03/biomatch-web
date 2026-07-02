"use client";

import { useState } from "react";
import {
	Bell,
	Eye,
	CheckCircle2,
	XCircle,
	MapPin,
	ArrowRight,
	Target,
	ChevronDown,
	ChevronUp,
	Clock,
} from "lucide-react";
import { displayBloodGroup } from "@/lib/donor-types";
import {
	useEmergencyRequestStatus,
	useConfirmDonation,
} from "@/hooks/use-emergency-requests";

interface LiveStatusPanelProps {
	requestId: string;
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
		key: "opened" as const,
		label: "Opened",
		icon: Eye,
		color: "text-orange-600",
		bg: "bg-orange-50 dark:bg-orange-950/10",
		border: "border-orange-200 dark:border-orange-900/50",
	},
	{
		key: "accepted" as const,
		label: "Accepted",
		icon: CheckCircle2,
		color: "text-green-600",
		bg: "bg-green-50 dark:bg-green-950/10",
		border: "border-green-200 dark:border-green-900/50",
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
		color: "text-blue-600",
		bg: "bg-blue-50 dark:bg-blue-950/10",
		border: "border-blue-200 dark:border-blue-900/50",
	},
	{
		key: "arrived" as const,
		label: "Arrived",
		icon: Target,
		color: "text-purple-600",
		bg: "bg-purple-50 dark:bg-purple-950/10",
		border: "border-purple-200 dark:border-purple-900/50",
	},
	{
		key: "completed" as const,
		label: "Completed",
		icon: Clock,
		color: "text-emerald-600",
		bg: "bg-emerald-50 dark:bg-emerald-950/10",
		border: "border-emerald-200 dark:border-emerald-900/50",
	},
];

export function LiveStatusPanel({ requestId }: LiveStatusPanelProps) {
	const { data: request, isLoading } = useEmergencyRequestStatus(requestId);
	const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
	const confirmDonation = useConfirmDonation();

	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center">
				<Clock className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!request) {
		return <p className="text-sm text-muted-foreground">Request not found.</p>;
	}

	const bloodGroup = displayBloodGroup(request.bloodGroup);
	const totalDonors = request.alerts.length;

	return (
		<div className="bg-card border-border rounded-3xl p-6 shadow-sm space-y-6">
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

			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
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
									? "ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-zinc-900"
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
				<div className="border-border rounded-2xl overflow-hidden">
					{(() => {
						const cfg = STATUS_CONFIG.find(
							(s) => s.key === expandedStatus,
						);
						const Icon = cfg?.icon ?? Bell;
						const filteredDonors = request.alerts.filter(
							(a) => a.status === expandedStatus,
						);
						return (
							<div>
								<div
									className={`${cfg?.bg ?? ""} px-4 py-2 flex items-center justify-between border-b ${cfg?.border ?? ""}`}
								>
									<div className="flex items-center gap-2">
										<Icon
											className={`h-4 w-4 ${cfg?.color ?? ""}`}
										/>
										<span className="text-sm font-semibold text-foreground">
											{cfg?.label} —{" "}
											{filteredDonors.length} donor
											{filteredDonors.length !== 1
												? "s"
												: ""}
										</span>
									</div>
									<button
										onClick={() => setExpandedStatus(null)}
										className="text-muted-foreground hover:text-muted-foreground cursor-pointer"
									>
										<ChevronUp className="h-4 w-4" />
									</button>
								</div>
								{filteredDonors.length === 0 ? (
									<p className="p-4 text-sm text-muted-foreground">
										No donors in this stage.
									</p>
								) : (
									<div className="divide-y divide-border">
										{filteredDonors.map((alert) => (
											<div
												key={alert.id}
												className="px-4 py-3 flex items-center justify-between gap-4"
											>
												<div className="flex items-center gap-3 min-w-0">
													<div
														className={`w-8 h-8 rounded-lg ${cfg?.bg ?? ""} flex items-center justify-center ${cfg?.color ?? ""} text-xs font-bold shrink-0`}
													>
														{alert.donor.name
															?.split(" ")
															.map(
																(n: string) =>
																	n[0],
															)
															.join("")
															.slice(0, 2)
															.toUpperCase() ??
															"?"}
													</div>
													<div>
														<p className="text-sm font-medium text-foreground truncate">
															{alert.donor.name}
														</p>
														<p className="text-xs text-muted-foreground">
															{displayBloodGroup(
																alert.donor
																	.bloodGroup,
															)}{" "}
															&bull;{" "}
															{alert.donor
																.location ??
																"Location unknown"}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-3 shrink-0">
													<span className="text-[10px] text-muted-foreground font-mono">
														{new Date(
															alert.updatedAt,
														).toLocaleTimeString(
															[],
															{
																hour: "2-digit",
																minute: "2-digit",
															},
														)}
													</span>
													{alert.status ===
														"arrived" && (
														<button
															onClick={() => {
																if (
																	window.confirm(
																		`Confirm donation for ${alert.donor.name}? This will update their donation record and award points.`,
																	)
																) {
																	confirmDonation.mutate(
																		{
																			alertId:
																				alert.id,
																		},
																	);
																}
															}}
															disabled={
																confirmDonation.isPending
															}
															className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-[10px] font-medium rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
														>
															{confirmDonation.isPending
																? "Confirming..."
																: "Confirm Donation"}
														</button>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						);
					})()}
				</div>
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
