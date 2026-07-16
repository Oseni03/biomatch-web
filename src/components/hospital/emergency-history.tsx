"use client";

import { useState } from "react";
import {
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Filter,
	AlertTriangle,
	CheckCircle2,
	XCircle,
	Target,
	Clock,
} from "lucide-react";
import {
	useEmergencyHistory,
} from "@/hooks/use-emergency-requests";
import { displayBloodGroup } from "@/lib/donor-types";
import { BLOOD_GROUP_MAP } from "@/lib/donor-types";

const BLOOD_GROUPS = Object.keys(BLOOD_GROUP_MAP);

const STATUS_OPTIONS = ["fulfilled", "expired", "cancelled"];

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
	fulfilled: {
		label: "Fulfilled",
		color: "text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900/50",
	},
	expired: {
		label: "Expired",
		color: "text-brand bg-brand-light border-brand/20",
	},
	cancelled: {
		label: "Cancelled",
		color: "text-muted-foreground bg-muted border-border",
	},
};

const FUNNEL_LABELS = [
	{ key: "alerted" as const, label: "Alerted" },
	{ key: "accepted" as const, label: "Accepted" },
	{ key: "en_route" as const, label: "En Route" },
	{ key: "arrived" as const, label: "Arrived" },
	{ key: "completed" as const, label: "Completed" },
];

interface EmergencyHistoryProps {
	hospitalId: string;
}

export function EmergencyHistory({ hospitalId }: EmergencyHistoryProps) {
	const [page, setPage] = useState(1);
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [bloodFilter, setBloodFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const filters = {
		...(dateFrom ? { dateFrom } : {}),
		...(dateTo ? { dateTo } : {}),
		...(bloodFilter ? { bloodGroup: bloodFilter } : {}),
		...(statusFilter ? { status: statusFilter } : {}),
		page,
		pageSize: 10,
	};

	const { data, isLoading } = useEmergencyHistory(hospitalId, filters);

	const handleFilter = () => {
		setPage(1);
	};

	return (
		<div className="space-y-6">
			<div className="bg-card border-border rounded-xl p-5 shadow-sm transition-shadow hover:shadow-card-hover">
				<div className="flex items-center gap-2 mb-4">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-semibold text-foreground">
						Filters
					</span>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
					<div>
						<label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
							From
						</label>
						<input
							type="date"
							value={dateFrom}
							onChange={(e) => setDateFrom(e.target.value)}
							className="w-full rounded-xl border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					<div>
						<label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
							To
						</label>
						<input
							type="date"
							value={dateTo}
							onChange={(e) => setDateTo(e.target.value)}
							className="w-full rounded-xl border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					<div>
						<label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
							Blood Type
						</label>
						<select
							value={bloodFilter}
							onChange={(e) => setBloodFilter(e.target.value)}
							className="w-full rounded-xl border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">All Types</option>
							{BLOOD_GROUPS.map((bg) => (
								<option key={bg} value={bg}>
									{displayBloodGroup(bg)}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
							Status
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full rounded-xl border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">All Statuses</option>
							{STATUS_OPTIONS.map((s) => (
								<option key={s} value={s}>
									{STATUS_BADGE[s]?.label ?? s}
								</option>
							))}
						</select>
					</div>
					<div className="flex items-end">
						<button
							onClick={handleFilter}
							className="w-full rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 transition cursor-pointer"
						>
							Apply Filters
						</button>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="flex h-32 items-center justify-center">
					<Clock className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			) : !data || data.requests.length === 0 ? (
				<div className="bg-card border-border rounded-xl p-10 text-center text-muted-foreground">
					<Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
					<p className="text-sm font-medium">
						No completed emergency requests found.
					</p>
					<p className="text-xs text-muted-foreground mt-1">
						Past requests with fulfilled, expired, or cancelled
						status will appear here.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{data.requests.map((req) => {
						const isExpanded = expandedId === req.id;
						const badge = STATUS_BADGE[req.status] ?? {
							label: req.status,
							color: "text-muted-foreground bg-muted border-border",
						};
						const totalFunnel = req.aggregates.alerted + req.aggregates.accepted + req.aggregates.en_route + req.aggregates.arrived + req.aggregates.completed;
						const shortfallStages = FUNNEL_LABELS.filter(
							(f) => req.aggregates[f.key] === 0,
						);

						return (
							<div
								key={req.id}
								className="bg-card border-border rounded-2xl shadow-sm overflow-hidden"
							>
								<button
									onClick={() =>
										setExpandedId(
											isExpanded ? null : req.id,
										)
									}
									className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted transition text-left"
								>
									<div className="flex items-center gap-4 flex-wrap">
										<div className="flex items-center gap-2">
											<span className="font-bold text-foreground">
												{displayBloodGroup(
													req.bloodGroup,
												)}
											</span>
											<span className="text-xs text-muted-foreground">
												{req.unitsNeeded} unit
												{req.unitsNeeded > 1
													? "s"
													: ""}
											</span>
										</div>
										<span
											className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${badge.color}`}
										>
											{badge.label}
										</span>
										{req.aggregates.alerted === 0 &&
											req.status === "expired" && (
												<span className="text-[10px] font-mono text-brand flex items-center gap-1">
													<AlertTriangle className="h-3 w-3" />
													No donors found
												</span>
											)}
										{req.aggregates.accepted === 0 &&
											req.aggregates.alerted > 0 &&
											req.status === "expired" && (
												<span className="text-[10px] font-mono text-orange-500 flex items-center gap-1">
													<AlertTriangle className="h-3 w-3" />
													No donors accepted
												</span>
											)}
									</div>
									<div className="flex items-center gap-3">
										<span className="text-xs text-muted-foreground font-mono hidden sm:inline">
											{new Date(
												req.createdAt,
											).toLocaleDateString()}
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
												const count =
													req.aggregates[f.key];
												const isZero = count === 0;
												return (
													<div
														key={f.key}
														className={`p-2 rounded-xl text-center border ${
															isZero
																? "border-brand/20 bg-brand-light"
																: "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/10"
														}`}
													>
														<span
															className={`text-lg font-bold font-mono block ${
																isZero
																	? "text-brand"
																	: "text-green-600"
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

										{shortfallStages.length > 0 &&
											req.status === "expired" && (
												<div className="p-3 bg-orange-50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/50 rounded-xl text-xs text-orange-700 dark:text-orange-400 flex items-start gap-2">
													<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
													<span>
														Shortfall detected at:{" "}
														<strong>
															{shortfallStages
																.map(
																	(f) =>
																		f.label,
																)
																.join(", ")}
														</strong>
														. Request expired
														without full
														fulfillment.
													</span>
												</div>
											)}

										{req.alerts.length > 0 && (
											<div>
												<p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
													All Donors
												</p>
												<div className="divide-y divide-border">
													{req.alerts.map(
														(alert) => (
															<div
																key={alert.id}
																className="py-2 flex items-center justify-between"
															>
																<span className="text-sm text-foreground">
																	{alert.donor.name ?? "Unknown"}
																</span>
																<span className="text-xs text-muted-foreground">
																	{displayBloodGroup(
																		alert.donor
																			.bloodGroup,
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
														),
													)}
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{data && data.totalPages > 1 && (
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page <= 1}
						className="p-2 rounded-xl border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
					>
						<ChevronLeft className="h-4 w-4" />
					</button>
					<span className="text-sm text-muted-foreground font-mono">
						Page {data.page} of {data.totalPages}
					</span>
					<button
						onClick={() =>
							setPage((p) => Math.min(data.totalPages, p + 1))
						}
						disabled={page >= data.totalPages}
						className="p-2 rounded-xl border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>
			)}
		</div>
	);
}
