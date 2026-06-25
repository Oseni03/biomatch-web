"use client";

import { Activity, MapPin, Clock, Bell, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EmergencyMatchRequest, DonorStatus } from "@/lib/donor-types";
import type { EligibilityResult } from "@/lib/eligibility";

interface EmergencyAlertsFeedProps {
	requests: EmergencyMatchRequest[];
	bloodType: string;
	eligibility: EligibilityResult;
	donorStatus: DonorStatus;
	donorApprovedRequests: string[];
	activeTrackingId: string | null;
	onRespond: (reqId: string) => void;
}

export function EmergencyAlertsFeed({
	requests,
	bloodType,
	eligibility,
	donorStatus,
	donorApprovedRequests,
	activeTrackingId,
	onRespond,
}: EmergencyAlertsFeedProps) {
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
						const isApproved =
							donorApprovedRequests.includes(req.id) ||
							req.status === "matched";
						const isTrackingThis = activeTrackingId === req.id;

						return (
							<div
								key={req.id}
								className={`bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${isApproved ? "border-green-300 dark:border-green-900/50" : ""}`}
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
										<span className="text-red-600 dark:text-red-400 font-bold uppercase">
											{isApproved
												? "Matched and Underway"
												: "Pending Response"}
										</span>
									</div>

									{isApproved ? (
										isTrackingThis ? (
											<button
												disabled
												className="px-5 py-2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-1.5"
											>
												<Clock className="h-4 w-4 animate-spin" />
												Transit Tracker Active
											</button>
										) : (
											<button
												disabled
												className="px-5 py-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/40 rounded-2xl text-xs font-semibold flex items-center gap-1.5"
											>
												<Check className="h-4 w-4" />
												Matched
											</button>
										)
									) : (
										<div className="flex gap-2 w-full sm:w-auto">
											<button className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-red-600 rounded-2xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition w-1/2 sm:w-auto">
												Decline
											</button>
											<button
												onClick={() =>
													onRespond(req.id)
												}
												disabled={
													!eligibility.eligible ||
													donorStatus !== "available"
												}
												className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-semibold transition w-1/2 sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
												title={
													!eligibility.eligible
														? "You must wait until deferral period is complete"
														: "Toggle Availability to Available"
												}
											>
												Accept and Depart
											</button>
										</div>
									)}
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
