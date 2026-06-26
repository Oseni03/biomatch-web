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
import { useEmergencyRequestStatus } from "@/hooks/use-emergency-requests";

interface LiveStatusPanelProps {
	requestId: string;
}

const STATUS_CONFIG = [
	{
		key: "alerted" as const,
		label: "Alerted",
		icon: Bell,
		color: "text-gray-600",
		bg: "bg-gray-50 dark:bg-zinc-800/50",
		border: "border-gray-200 dark:border-zinc-700",
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
		color: "text-red-600",
		bg: "bg-red-50 dark:bg-red-950/10",
		border: "border-red-200 dark:border-red-900/50",
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

	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center">
				<Clock className="h-5 w-5 animate-spin text-gray-400" />
			</div>
		);
	}

	if (!request) {
		return (
			<p className="text-sm text-gray-500">Request not found.</p>
		);
	}

	const bloodGroup = displayBloodGroup(request.bloodGroup);
	const totalDonors = request.alerts.length;

	return (
		<div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
			<div className="flex items-center justify-between flex-wrap gap-2">
				<div>
					<h3 className="font-bold text-lg text-gray-900 dark:text-white">
						{bloodGroup} — {request.unitsNeeded} unit{request.unitsNeeded > 1 ? "s" : ""}
					</h3>
					<p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
						{request.hospital.name}
						{request.hospital.location && (
							<>
								<span>&bull;</span>
								<MapPin className="h-3 w-3" />
								{request.hospital.location}
							</>
						)}
						<span>&bull;</span>
						<span className="capitalize">{request.urgencyLevel}</span>
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-red-50 text-red-600 rounded border border-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-900/50">
						{request.status}
					</span>
					<span className="text-xs text-gray-400 font-mono">
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
							<span className="text-lg font-bold font-mono block text-gray-900 dark:text-white">
								{count}
							</span>
							<span className="text-[9px] font-mono uppercase text-gray-400 tracking-wider">
								{cfg.label}
							</span>
						</button>
					);
				})}
			</div>

			{expandedStatus && (
				<div className="border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
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
										<span className="text-sm font-semibold text-gray-900 dark:text-white">
											{cfg?.label} — {filteredDonors.length} donor
											{filteredDonors.length !== 1 ? "s" : ""}
										</span>
									</div>
									<button
										onClick={() => setExpandedStatus(null)}
										className="text-gray-400 hover:text-gray-600 cursor-pointer"
									>
										<ChevronUp className="h-4 w-4" />
									</button>
								</div>
								{filteredDonors.length === 0 ? (
									<p className="p-4 text-sm text-gray-400">
										No donors in this stage.
									</p>
								) : (
									<div className="divide-y divide-gray-100 dark:divide-zinc-800">
										{filteredDonors.map((alert) => (
											<div
												key={alert.id}
												className="px-4 py-3 flex items-center justify-between"
											>
												<div className="flex items-center gap-3">
													<div
														className={`w-8 h-8 rounded-lg ${cfg?.bg ?? ""} flex items-center justify-center ${cfg?.color ?? ""} text-xs font-bold`}
													>
														{alert.donor.name
															?.split(" ")
															.map(
																(n: string) =>
																	n[0],
															)
															.join("")
															.slice(0, 2)
															.toUpperCase() ?? "?"}
													</div>
													<div>
														<p className="text-sm font-medium text-gray-900 dark:text-white">
															{alert.donor.name}
														</p>
														<p className="text-xs text-gray-400">
															{displayBloodGroup(
																alert.donor
																	.bloodGroup,
															)}{" "}
															&bull;{" "}
															{alert.donor.location ??
																"Location unknown"}
														</p>
													</div>
												</div>
												<span className="text-[10px] text-gray-400 font-mono">
													{new Date(
														alert.updatedAt,
													).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						);
					})()}
				</div>
			)}

			<div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 dark:border-zinc-800 pt-4">
				<ArrowRight className="h-3 w-3" />
				<span>
					{totalDonors} donor{totalDonors !== 1 ? "s" : ""} alerted &mdash;{" "}
					{request.aggregates.accepted + request.aggregates.en_route + request.aggregates.arrived + request.aggregates.completed} responded
					{request.searchRadius && (
						<>
							{" "}&bull; Radius: {request.searchRadius}km
						</>
					)}
				</span>
			</div>
		</div>
	);
}
