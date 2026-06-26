"use client";

import { useState } from "react";
import {
	Activity,
	MapPin,
	Clock,
	Bell,
	Check,
	X,
	Navigation,
	LogIn,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EmergencyMatchRequest, DonorStatus } from "@/lib/donor-types";
import type { EligibilityResult } from "@/lib/eligibility";

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

function donorActionLabel(
	status: string | undefined,
	activeTrackingId: string | null,
	reqId: string,
): string {
	if (activeTrackingId === reqId) return "In Transit";
	if (status === "arrived" || status === "completed") return "Fulfilled";
	if (status === "en_route") return "Mark Arrived";
	if (status === "accepted") return "Mark En Route";
	if (status === "declined") return "Declined";
	return "Pending Response";
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
			<div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
				<div>
					<h3 className="font-bold flex items-center gap-2 text-red-600">
						<Bell className="h-5 w-5" />
						Urgent Emergency Match Feed
					</h3>
					<p className="text-xs text-gray-400 mt-1">
						Matching compatible Blood Type:{" "}
						<strong className="text-red-600 font-mono">
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
					<div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-10 text-center text-gray-500">
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
								<div
									key={req.id}
									className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-150 dark:border-zinc-800 rounded-3xl p-4"
								>
									<button
										onClick={() => toggleDeclined(req.id)}
										className="w-full flex items-center justify-between text-left"
									>
										<span className="flex items-center gap-2 text-xs text-gray-400">
											<X className="h-3.5 w-3.5 text-gray-300" />
											Declined — {req.hospitalName} (
											{req.bloodType})
										</span>
										<span className="text-[10px] text-gray-300 font-mono">
											{new Date(
												req.timestamp,
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</button>
								</div>
							);
						}

						return (
							<div
								key={req.id}
								className={`bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${
									isApproved
										? "border-green-300 dark:border-green-900/50"
										: ""
								} ${isDeclined ? "opacity-50" : ""}`}
							>
								<div className="absolute right-6 top-6 w-11 h-11 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 font-bold font-mono">
									{req.bloodType}
								</div>

								<div className="flex items-start gap-3 border-b border-gray-100 dark:border-zinc-800/80 pb-4 mb-4">
									<Activity className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-bold text-base md:text-lg">
												{req.hospitalName}
											</span>
											{req.urgency === "critical" ? (
												<Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 font-mono text-[10px] tracking-wider animate-pulse">
													CRITICAL
												</Badge>
											) : (
												<Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 font-mono text-[10px] tracking-wider">
													HIGH
												</Badge>
											)}
										</div>

										<div className="flex items-center gap-4 text-xs text-gray-400 mt-1 font-medium">
											<span className="flex items-center gap-1">
												<MapPin className="h-3.5 w-3.5" />
												{req.location}
											</span>
											<span className="flex items-center gap-1">
												<Clock className="h-3.5 w-3.5" />
												{new Date(
													req.timestamp,
												).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800/60 pb-3.5 mb-3.5">
									<div className="text-xs text-gray-500 dark:text-zinc-400 space-y-1 text-left">
										<div>
											Required:{" "}
											<strong className="text-gray-900 dark:text-white font-semibold">
												{req.requiredPints} Pints
											</strong>{" "}
											- Emergency Hotline:{" "}
											<span className="font-mono text-red-600 dark:text-red-400">
												{req.contactPhone}
											</span>
										</div>
										<div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 flex-wrap">
											<span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
												<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
												Push Notification: DELIVERED
											</span>
											<span>-</span>
											{req.urgency === "critical" ? (
												<span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
													<span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
													SMS Fallback: SENT
													SIMULTANEOUSLY
												</span>
											) : (
												<span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
													<span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
													SMS Fallback: QUEUED FOR
													2-MIN TIMEOUT
												</span>
											)}
										</div>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
									<div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
										Status:{" "}
										<span
											className={`font-bold uppercase ${
												isDeclined
													? "text-gray-400"
													: isApproved
														? "text-green-600"
														: "text-red-600 dark:text-red-400"
											}`}
										>
											{isDeclined
												? "Declined"
												: isApproved
													? donorActionLabel(
															alertStatus,
															activeTrackingId,
															req.id,
														)
													: "Pending Response"}
										</span>
									</div>

									<div className="flex gap-2 w-full sm:w-auto">
										{isDeclined ? (
											<button
												onClick={() =>
													toggleDeclined(req.id)
												}
												className="px-3 py-1.5 border border-gray-200 text-gray-400 rounded-2xl text-xs hover:bg-gray-50 transition"
											>
												{collapsedDeclined[req.id]
													? "Show"
													: "Hide"}
											</button>
										) : isApproved ? (
											<>
												{alertStatus === "accepted" && (
													<button
														onClick={() =>
															onMarkEnRoute(
																req.id,
															)
														}
														disabled={
															isTrackingThis
														}
														className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
													>
														<Navigation className="h-3.5 w-3.5" />
														Mark En Route
													</button>
												)}
												{alertStatus === "en_route" && (
													<button
														onClick={() =>
															onMarkArrived(
																req.id,
															)
														}
														disabled={
															isTrackingThis
														}
														className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
													>
														<LogIn className="h-3.5 w-3.5" />
														Mark Arrived
													</button>
												)}
												{(alertStatus === "arrived" ||
													alertStatus ===
														"completed") && (
													<span className="px-4 py-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/40 rounded-2xl text-xs font-semibold flex items-center gap-1.5">
														<Check className="h-3.5 w-3.5" />
														Fulfilled
													</span>
												)}
											</>
										) : (
											<>
												<button
													onClick={() =>
														onDecline(req.id)
													}
													className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-red-600 rounded-2xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
												>
													Decline
												</button>
												<button
													onClick={() =>
														onRespond(req.id)
													}
													disabled={
														!eligibility.eligible ||
														donorStatus !==
															"available"
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
					})
				)}
			</div>
		</div>
	);
}
