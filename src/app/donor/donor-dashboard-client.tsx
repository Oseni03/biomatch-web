"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { useDonorHistory } from "@/hooks/use-donor-history";
import { useInventory } from "@/hooks/use-inventory";
import { useCityLabels } from "@/hooks/use-city-labels";
import { markAlertOpened } from "@/servers/emergency";
import { getEligibility } from "@/lib/eligibility";
import {
	displayBloodGroup,
	type EmergencyMatchRequest,
} from "@/lib/donor-types";
import {
	useDonorAlerts,
	useDonorConfirmDonation,
} from "@/hooks/use-emergency-requests";
import { useEmergencyMissionTracker } from "@/hooks/use-emergency-mission-tracker";
import { useDonorSettingsForm } from "@/hooks/use-donor-settings-form";
import { useDonorVerificationStatus } from "@/hooks/use-screening";
import { toast } from "sonner";

import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { ActiveMissionTracker } from "@/components/donor/active-mission-tracker";
import { DeferralStatusCard } from "@/components/donor/deferral-status-card";
import { LocationSettingsCard } from "@/components/donor/location-settings-card";
import { EmergencyAlertsFeed } from "@/components/donor/emergency-alerts-feed";
import { BloodSupplyChart } from "@/components/donor/blood-supply-chart";
import { DonationHistoryCard } from "@/components/donor/donation-history-card";
import { EligibilityBanner } from "@/components/donor/eligibility-banner";
import { VerificationStatusBanner } from "@/components/donor/verification-status-banner";
import { BlacklistedBanner } from "@/components/donor/blacklisted-banner";
import { ProfileIncompleteBanner } from "@/components/donor/profile-incomplete-banner";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function DonorDashboardClient({
	profileComplete,
}: {
	profileComplete: boolean;
}) {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useDonorDashboard();
	const { data: banks } = useInventory();
	const { data: verificationStatus } = useDonorVerificationStatus(
		session?.user?.id,
	);
	const [page, setPage] = useState(1);

	const handleFilter = () => {
		setPage(1);
	};
	const { data: alerts } = useDonorAlerts(session?.user?.id, {
		page,
		pageSize: 10,
	});
	const { data: historyData } = useDonorHistory(1);
	const { data: cityLabels = [] } = useCityLabels();

	const bloodType = displayBloodGroup(user?.bloodGroup);
	const lastDonationDate = user?.lastDonationDate
		? new Date(user.lastDonationDate).toISOString().slice(0, 10)
		: null;
	const eligibility = getEligibility(lastDonationDate);
	const walletData = user?.wallet;
	const completedCount = walletData?.lifetimeDonations ?? 0;

	const openedAlertIds = useRef<Set<string>>(new Set());

	const actionableAlerts = (alerts?.alerts ?? []).filter(
		(a: { request: { status: string } }) =>
			a.request.status === "pending" || a.request.status === "matched",
	);

	const requests: EmergencyMatchRequest[] = actionableAlerts.map(
		(a: {
			id: string;
			donorConfirmedAt: Date | null;
			request: {
				organization: {
					name: string;
					hospitalBanks: { location: string }[];
				} | null;
				bloodGroup: string;
				unitsNeeded: number;
				urgencyLevel: string;
				createdAt: Date;
				status: string;
			};
			status: string;
		}) => ({
			id: a.id,
			hospitalName: a.request.organization?.name ?? "Unknown",
			location:
				a.request.organization?.hospitalBanks[0]?.location ?? "Unknown",
			bloodType: displayBloodGroup(a.request.bloodGroup),
			requiredPints: a.request.unitsNeeded,
			contactPhone: "N/A",
			urgency:
				a.request.urgencyLevel === "critical"
					? ("critical" as const)
					: ("high" as const),
			timestamp: new Date(a.request.createdAt).toISOString(),
			status: a.request.status as "pending" | "matched" | "completed",
			donorConfirmedAt: a.donorConfirmedAt
				? new Date(a.donorConfirmedAt).toISOString()
				: null,
		}),
	);

	const donorAlertStatuses: Record<string, string> = {};
	for (const a of alerts?.alerts ?? []) {
		donorAlertStatuses[a.id] = a.status;
	}

	useEffect(() => {
		for (const a of alerts?.alerts ?? []) {
			if (a.status === "alerted" && !openedAlertIds.current.has(a.id)) {
				openedAlertIds.current.add(a.id);
				markAlertOpened(a.id).catch(() => {});
			}
		}
	}, [alerts]);

	const deferralPercent =
		eligibility.windowDays > 0
			? Math.min(
					100,
					Math.floor(
						((eligibility.windowDays - eligibility.daysRemaining) /
							eligibility.windowDays) *
							100,
					),
				)
			: 100;

	const {
		donorStatus,
		setDonorStatus,
		donorLocation,
		setDonorLocation,
		maxRadius,
		setMaxRadius,
		smsFallbackEnabled,
		setSmsFallbackEnabled,
		settingsSuccess,
		lastDonationDateInput,
		setLastDonationDateInput,
		handleSaveSettings,
	} = useDonorSettingsForm({
		userId: session?.user?.id,
		userLocation: user?.location,
		userIsActive: user?.isActive,
		lastDonationDate,
	});

	const {
		activeTrackingId,
		trackingStatus,
		setActiveTrackingId,
		handleRespond,
		handleDecline,
		handleWithdraw,
		handleMarkEnRoute,
		handleMarkArrived,
	} = useEmergencyMissionTracker();

	const donorConfirmDonation = useDonorConfirmDonation();
	const handleConfirmDonation = (alertId: string) => {
		if (!session?.user?.id) return;
		donorConfirmDonation.mutate({ alertId, donorId: session.user.id });
	};

	const donationRecords = historyData?.records ?? [];
	const activeRequest = requests.find((r) => r.id === activeTrackingId);
	const isLoading = sessionLoading || userLoading;
	const pendingResponseCount = requests.filter(
		(request) =>
			!((donorAlertStatuses[request.id] ?? "") === "accepted" ||
				(donorAlertStatuses[request.id] ?? "") === "en_route" ||
				(donorAlertStatuses[request.id] ?? "") === "arrived" ||
				(donorAlertStatuses[request.id] ?? "") === "completed" ||
				(donorAlertStatuses[request.id] ?? "") === "declined"),
	).length;

	const nextAction = (() => {
		if (activeTrackingId && activeRequest) {
			return {
				title: "You have an active donation mission",
				body: `Track your response to ${activeRequest.hospitalName} and confirm when you arrive or complete the donation.`,
				pill: "Active mission",
				pillClass: "bg-status-info-bg text-status-info border-status-info/30",
			};
		}
		if (verificationStatus === "unverified") {
			return {
				title: "Start screening to receive matched requests",
				body: "You have no screening on file yet, so hospitals cannot send emergency donation requests to you. Visit a partner hospital for a walk-in screening to unlock matching.",
				pill: "Verification",
				pillClass: "bg-status-low-bg text-status-low border-status-low/30",
			};
		}
		if (verificationStatus === "pending") {
			return {
				title: "Your screening is being reviewed",
				body: "A partner hospital has recorded your screening. You’ll be notified by email when the result is ready, and then matching can begin.",
				pill: "Pending",
				pillClass: "bg-status-info-bg text-status-info border-status-info/30",
			};
		}
		if (verificationStatus === "failed") {
			return {
				title: "Book a follow-up screening to regain eligibility",
				body: "Your most recent screening did not pass, but you can still return to a partner hospital for a follow-up check. A new result may restore your ability to match.",
				pill: "Follow-up",
				pillClass: "bg-status-critical-bg text-status-critical border-status-critical/30",
			};
		}
		if (!eligibility.eligible) {
			return {
				title: `Eligible again in ${eligibility.daysRemaining} days`,
				body: "Your recovery period is still active. You’ll be able to receive emergency requests again once the countdown ends.",
				pill: "Cooldown",
				pillClass: "bg-status-low-bg text-status-low border-status-low/30",
			};
		}
		if (donorStatus !== "available") {
			return {
				title: "Set yourself available to receive alerts",
				body: "Your current availability is not active, so hospitals will not route emergency matches to you. Update your preferred status in the settings panel below when you’re ready.",
				pill: "Availability",
				pillClass: "bg-status-low-bg text-status-low border-status-low/30",
			};
		}
		if (pendingResponseCount > 0) {
			return {
				title: `Review ${pendingResponseCount} matched donation request${pendingResponseCount > 1 ? "s" : ""}`,
				body: "A hospital is waiting on your response. Accept, decline, or update your status from the matched requests below.",
				pill: "Action needed",
				pillClass: "bg-status-ok-bg text-status-ok border-status-ok/30",
			};
		}
		if (requests.length > 0) {
			return {
				title: "You’re matched and ready to respond",
				body: "Your active match queue is ready. Keep your status set to available so hospitals can reach you for urgent blood needs.",
				pill: "Ready",
				pillClass: "bg-status-ok-bg text-status-ok border-status-ok/30",
			};
		}
		return {
			title: "No matched requests right now",
			body: "There are currently no hospital requests waiting for your response. Stay available and your dashboard will update as new matches come in.",
			pill: "Standby",
			pillClass: "bg-muted text-muted-foreground border-border",
		};
	})();

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (userError) {
		toast.error("Failed to load dashboard data");
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">
				Sign in to view the donor dashboard
			</p>
		);
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.08 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 16 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
	};

	return (
		<motion.div
			className="space-y-8"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<motion.div variants={itemVariants}>
				<DashboardGreeting
					title={`Welcome back, ${session.user.name?.split(" ")[0] ?? "Donor"}.`}
					subtitle={
						eligibility.eligible
							? "You're eligible to donate right now."
							: `Eligible again in ${eligibility.daysRemaining} days.`
					}
					action={
						user?.bloodGroup ? (
							<BloodTypeBadge bloodGroup={user.bloodGroup} size="lg" />
						) : undefined
					}
				/>
			</motion.div>

			<motion.div variants={itemVariants}>
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div className="space-y-2">
							<p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
								Next action
							</p>
							<h2 className="text-xl font-bold text-foreground">
								{nextAction.title}
							</h2>
							<p className="max-w-2xl text-sm text-muted-foreground">
								{nextAction.body}
							</p>
						</div>
						<span
							className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] ${nextAction.pillClass}`}
						>
							{nextAction.pill}
						</span>
					</div>
				</div>
			</motion.div>

		{!profileComplete && (
			<motion.div variants={itemVariants}>
				<ProfileIncompleteBanner />
			</motion.div>
		)}

		{verificationStatus && verificationStatus !== "verified" && (
			<motion.div variants={itemVariants}>
				<VerificationStatusBanner status={verificationStatus} />
			</motion.div>
		)}

		{eligibility.eligible && lastDonationDate && (
				<motion.div variants={itemVariants}>
					<EligibilityBanner />
				</motion.div>
			)}

			{activeTrackingId && activeRequest && (
				<motion.div variants={itemVariants}>
					<ActiveMissionTracker
						request={activeRequest}
						trackingStatus={trackingStatus}
						donorLocation={donorLocation}
						onAbort={() => {
							setActiveTrackingId(null);
						}}
						onSimulateArrival={() =>
							trackingStatus === "accepted"
								? handleMarkEnRoute(activeTrackingId)
								: handleMarkArrived(activeTrackingId)
						}
					/>
				</motion.div>
			)}

			<motion.div
				variants={itemVariants}
				className="grid grid-cols-1 lg:grid-cols-3 gap-8"
			>
				<div className="space-y-8 lg:col-span-1">
					<DeferralStatusCard
						eligibility={eligibility}
						lastDonationDate={lastDonationDate}
						lastDonationDateInput={lastDonationDateInput}
						onDateChange={setLastDonationDateInput}
						deferralPercent={deferralPercent}
					/>

					<LocationSettingsCard
						donorStatus={donorStatus}
						onStatusChange={setDonorStatus}
						donorLocation={donorLocation}
						onLocationChange={setDonorLocation}
						maxRadius={maxRadius}
						onRadiusChange={setMaxRadius}
						smsFallbackEnabled={smsFallbackEnabled}
						onSmsFallbackChange={setSmsFallbackEnabled}
						settingsSuccess={settingsSuccess}
						onSave={handleSaveSettings}
						locations={cityLabels}
					/>
				</div>

				<div className="space-y-8 lg:col-span-2">
					{alerts?.blacklisted ? (
						<BlacklistedBanner />
					) : (
						<EmergencyAlertsFeed
							requests={requests}
							bloodType={bloodType}
							eligibility={eligibility}
							donorStatus={donorStatus}
							donorAlertStatuses={donorAlertStatuses}
							activeTrackingId={activeTrackingId}
							onRespond={handleRespond}
							onDecline={handleDecline}
							onWithdraw={(reqId, reason) =>
								handleWithdraw(reqId, session?.user?.id, reason)
							}
							onMarkEnRoute={handleMarkEnRoute}
							onMarkArrived={handleMarkArrived}
							onConfirmDonation={handleConfirmDonation}
						/>
					)}
					{alerts && !alerts.blacklisted && alerts.totalPages > 1 && (
						<PaginationControls
							page={page}
							totalPages={alerts.totalPages}
							onPageChange={setPage}
							variant="numbered"
						/>
					)}

					<BloodSupplyChart banks={banks} bloodType={bloodType} />

					<DonationHistoryCard records={donationRecords} />
				</div>
			</motion.div>

		</motion.div>
	);
}
