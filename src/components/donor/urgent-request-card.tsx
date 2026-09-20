"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Heart, Loader2, MapPin } from "lucide-react";

import type { EmergencyMatchRequest } from "@/lib/donor-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Request shape the card renders. `emergencyRef` and `facilityDepartment`
 * are optional: when your API starts returning them, just map them in
 * `buildRequests`. Until then the ref is derived from the alert id and the
 * department line is simply not shown.
 */
export type UrgentRequestView = EmergencyMatchRequest & {
	emergencyRef?: string;
	facilityDepartment?: string | null;
};

type EligibilityLike = {
	eligible: boolean;
	daysRemaining?: number | null;
};

interface EmergencyRequestCardProps {
	request: UrgentRequestView;
	alertStatus?: string;
	isTracked?: boolean;
	eligibility: EligibilityLike;
	donorStatus: "available" | "inactive" | (string & {});
	onRespond: (alertId: string) => unknown;
	onDecline: (alertId: string) => unknown;
	onWithdraw: (alertId: string, reason?: string) => unknown;
	onMarkEnRoute: (alertId: string) => unknown;
	onMarkArrived: (alertId: string) => unknown;
	onConfirmDonation: (alertId: string) => unknown;
}

/* ------------------------------------------------------------------ */
/* Alert status → UI stage                                             */
/* Edit these lists if your alert statuses are named differently.      */
/* Any status not listed is treated as "confirmed" (donor accepted).   */
/* ------------------------------------------------------------------ */

type Stage =
	| "decision"
	| "closed"
	| "confirmed"
	| "en_route"
	| "arrived"
	| "donated";

const DECISION_STATUSES = ["alerted", "opened", "pending", "sent"];
const CLOSED_STATUSES = ["declined", "withdrawn", "expired", "cancelled"];

function getStage(status: string | undefined, confirmedAt: string | null): Stage {
	if (confirmedAt) return "donated";
	if (!status || DECISION_STATUSES.includes(status)) return "decision";
	if (CLOSED_STATUSES.includes(status)) return "closed";
	if (status === "en_route") return "en_route";
	if (status === "arrived") return "arrived";
	if (status === "donated" || status === "completed") return "donated";
	return "confirmed";
}

const RESPONSE_COPY: Record<
	Exclude<Stage, "decision" | "closed">,
	{ headline: string; body: (hospital: string, address: string, ref: string) => React.ReactNode }
> = {
	confirmed: {
		headline: "Response Confirmed — You're helping save a life",
		body: (hospital, address, ref) => (
			<>
				Please head directly to{" "}
				<strong className="text-foreground">{hospital}</strong> at {address}.
				Quote emergency reference{" "}
				<span className="font-mono font-bold text-foreground">{ref}</span> at
				the blood bank reception.
			</>
		),
	},
	en_route: {
		headline: "You're on your way",
		body: (hospital, _address, ref) => (
			<>
				The blood bank at{" "}
				<strong className="text-foreground">{hospital}</strong> is expecting
				you. Quote{" "}
				<span className="font-mono font-bold text-foreground">{ref}</span> on
				arrival.
			</>
		),
	},
	arrived: {
		headline: "You've arrived",
		body: () => <>Once the blood bank team completes your donation, confirm it below.</>,
	},
	donated: {
		headline: "Donation confirmed — thank you",
		body: () => (
			<>The attending hospital will record this on your BioMATCH donor ledger.</>
		),
	},
};

const WITHDRAW_REASONS = [
	"Feeling unwell",
	"Can't reach the hospital in time",
	"Something urgent came up",
	"Other",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string, now: number): string {
	const diffMin = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
	if (diffMin < 1) return "Just now";
	if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
	const hours = Math.floor(diffMin / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	const days = Math.floor(hours / 24);
	return `${days} day${days === 1 ? "" : "s"} ago`;
}

function useNow(intervalMs = 30_000) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const t = setInterval(() => setNow(Date.now()), intervalMs);
		return () => clearInterval(t);
	}, [intervalMs]);
	return now;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function EmergencyRequestCard({
	request,
	alertStatus,
	eligibility,
	donorStatus,
	onRespond,
	onDecline,
	onWithdraw,
	onMarkEnRoute,
	onMarkArrived,
	onConfirmDonation,
}: EmergencyRequestCardProps) {
	const now = useNow();
	const [busy, setBusy] = useState<string | null>(null);
	const [withdrawOpen, setWithdrawOpen] = useState(false);

	const stage = getStage(alertStatus, request.donorConfirmedAt);
	const isResponded = stage !== "decision" && stage !== "closed";
	const isCritical = request.urgency === "critical";
	const ref = request.emergencyRef ?? `EM-${request.id.slice(-4).toUpperCase()}`;
	const units = request.requiredPints;

	const blockedReason = !eligibility.eligible
		? `Deferral active — you can donate again in ${eligibility.daysRemaining ?? "a few"} days.`
		: donorStatus === "inactive"
			? "Your donor status is inactive. Turn on availability in your profile to respond."
			: null;

	async function run(key: string, fn: () => unknown) {
		setBusy(key);
		try {
			await fn();
		} finally {
			setBusy(null);
		}
	}

	return (
		<article
			className={cn(
				"space-y-6 rounded-2xl border bg-card p-5 shadow-xl shadow-black/40 transition-all sm:p-7",
				isResponded
					? "border-status-ok/30"
					: "border-border hover:border-foreground/20",
			)}
		>
			{/* Header: blood group, units, ref, urgency, time */}
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
				<div className="flex items-center gap-3">
					<div className="rounded-xl border border-brand/30 bg-brand/10 px-3.5 py-1.5 font-mono text-lg font-extrabold text-brand sm:text-xl">
						{request.bloodType}
					</div>
					<div>
						<div className="text-base font-bold text-foreground sm:text-lg">
							{units} {units === 1 ? "Unit" : "Units"} Needed
						</div>
						<div className="font-mono text-xs text-muted-foreground">
							Ref: {ref}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
							isCritical
								? "border-status-critical/30 bg-status-critical/10 text-status-critical"
								: "border-status-low/30 bg-status-low-bg text-status-low",
						)}
					>
						<span
							className={cn(
								"h-1.5 w-1.5 animate-pulse rounded-full",
								isCritical ? "bg-status-critical" : "bg-status-low",
							)}
						/>
						{isCritical ? "Critical" : "Urgent"}
					</span>
					<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
						<Clock className="h-3.5 w-3.5" />
						{timeAgo(request.timestamp, now)}
					</span>
				</div>
			</div>

			{/* Hospital + address (visible before accepting) */}
			<div className="space-y-3 text-xs sm:text-sm">
				<div>
					<div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
						Hospital Name
					</div>
					<div className="text-base font-bold text-foreground">
						{request.hospitalName}
					</div>
					{request.facilityDepartment && (
						<div className="mt-0.5 text-xs font-medium text-brand/90">
							{request.facilityDepartment}
						</div>
					)}
				</div>

				<div className="pt-2">
					<div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
						Exact Hospital Address
					</div>
					<div className="flex items-start gap-2 rounded-xl border border-border bg-background p-3 text-xs text-foreground sm:text-sm">
						<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
						<span className="leading-relaxed">{request.location}</span>
					</div>
				</div>
			</div>

			{/* Action area */}
			{stage === "decision" && (
				<div className="space-y-2.5 pt-2">
					<div className="flex flex-col items-center gap-3 sm:flex-row">
						<Button
							size="lg"
							disabled={busy !== null || blockedReason !== null}
							onClick={() => run("respond", () => onRespond(request.id))}
							className="h-12 w-full rounded-full text-sm font-bold shadow-lg shadow-brand/30 sm:w-2/3"
						>
							{busy === "respond" ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									I Can Help
									<Heart className="h-4 w-4 fill-current" />
								</>
							)}
						</Button>
						<Button
							size="lg"
							variant="outline"
							disabled={busy !== null}
							onClick={() => run("decline", () => onDecline(request.id))}
							className="h-12 w-full rounded-full text-xs text-muted-foreground hover:text-foreground sm:w-1/3 sm:text-sm"
						>
							{busy === "decline" ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Not Available"
							)}
						</Button>
					</div>
					{blockedReason && (
						<p className="text-center text-[11px] text-muted-foreground">
							{blockedReason}
						</p>
					)}
				</div>
			)}

			{stage === "closed" && (
				<p className="rounded-xl border border-border bg-muted/50 p-3.5 text-xs text-muted-foreground">
					You're not responding to this request. We'll notify you when another
					one comes up.
				</p>
			)}

			{isResponded && (
				<>
					<div className="space-y-2 rounded-xl border border-status-ok/30 bg-status-ok-bg p-4 text-xs sm:text-sm">
						<div className="flex items-center gap-2 font-bold text-status-ok">
							<Check className="h-4 w-4" />
							<span>{RESPONSE_COPY[stage as keyof typeof RESPONSE_COPY].headline}</span>
						</div>
						<p className="leading-relaxed text-muted-foreground">
							{RESPONSE_COPY[stage as keyof typeof RESPONSE_COPY].body(
								request.hospitalName,
								request.location,
								ref,
							)}
						</p>
					</div>

					{stage !== "donated" && (
						<div className="space-y-3">
							<div className="flex flex-col items-center gap-3 sm:flex-row">
								{stage === "confirmed" && (
									<Button
										size="lg"
										disabled={busy !== null}
										onClick={() => run("enroute", () => onMarkEnRoute(request.id))}
										className="h-12 w-full rounded-full text-sm font-bold sm:w-2/3"
									>
										{busy === "enroute" ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											"I'm On My Way"
										)}
									</Button>
								)}
								{stage === "en_route" && (
									<Button
										size="lg"
										disabled={busy !== null}
										onClick={() => run("arrived", () => onMarkArrived(request.id))}
										className="h-12 w-full rounded-full text-sm font-bold sm:w-2/3"
									>
										{busy === "arrived" ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											"I've Arrived"
										)}
									</Button>
								)}
								{stage === "arrived" && (
									<Button
										size="lg"
										disabled={busy !== null}
										onClick={() => run("confirm", () => onConfirmDonation(request.id))}
										className="h-12 w-full rounded-full text-sm font-bold sm:w-2/3"
									>
										{busy === "confirm" ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											"Confirm Donation"
										)}
									</Button>
								)}
								<Button
									size="lg"
									variant="outline"
									disabled={busy !== null}
									onClick={() => setWithdrawOpen((o) => !o)}
									aria-expanded={withdrawOpen}
									className="h-12 w-full rounded-full text-xs text-muted-foreground hover:text-foreground sm:w-1/3 sm:text-sm"
								>
									Can't Make It
								</Button>
							</div>

							{withdrawOpen && (
								<div className="space-y-2 rounded-xl border border-border bg-background p-3">
									<p className="text-xs font-medium text-muted-foreground">
										Tell the hospital why you're withdrawing:
									</p>
									<div className="flex flex-wrap gap-2">
										{WITHDRAW_REASONS.map((reason) => (
											<button
												key={reason}
												type="button"
												disabled={busy !== null}
												onClick={() =>
													run("withdraw", async () => {
														await onWithdraw(request.id, reason);
														setWithdrawOpen(false);
													})
												}
												className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-50"
											>
												{reason}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</>
			)}
		</article>
	);
}