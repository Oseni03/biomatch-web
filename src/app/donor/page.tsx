"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { useDonorHistory } from "@/hooks/use-donor-history";
import { getAllHospitalBanks } from "@/servers/hospital";
import { getAllCityLabels } from "@/servers/location";
import { markAlertOpened } from "@/servers/emergency";
import { getEligibility } from "@/lib/eligibility";
import { ELIGIBILITY_DAYS } from "@/lib/constants";
import {
	displayBloodGroup,
	type EmergencyMatchRequest,
} from "@/lib/donor-types";
import { useDonorAlerts } from "@/hooks/use-emergency-requests";
import { useEmergencyMissionTracker } from "@/hooks/use-emergency-mission-tracker";
import { useDonorSettingsForm } from "@/hooks/use-donor-settings-form";
import { toast } from "sonner";

import { ActiveMissionTracker } from "@/components/donor/active-mission-tracker";
import { DeferralStatusCard } from "@/components/donor/deferral-status-card";
import { LocationSettingsCard } from "@/components/donor/location-settings-card";
import { EmergencyAlertsFeed } from "@/components/donor/emergency-alerts-feed";
import { BloodSupplyChart } from "@/components/donor/blood-supply-chart";
import { DonationHistoryCard } from "@/components/donor/donation-history-card";
import { SuccessModal } from "@/components/donor/success-modal";
import { EligibilityBanner } from "@/components/donor/eligibility-banner";

export default function DonorDashboardPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useDonorDashboard();
	const { data: banks } = useQuery({
		queryKey: ["hospital-banks"],
		queryFn: () => getAllHospitalBanks(),
	});
	const [page, setPage] = useState(1);

	const handleFilter = () => {
		setPage(1);
	};
	const { data: alerts } = useDonorAlerts(session?.user?.id, {
		page,
		pageSize: 10,
	});
	const { data: historyData } = useDonorHistory(1);
	const { data: cityLabels = [] } = useQuery({
		queryKey: ["city-labels"],
		queryFn: () => getAllCityLabels(),
	});

	const bloodType = displayBloodGroup(user?.bloodGroup);
	const lastDonationDate = user?.lastDonationDate
		? new Date(user.lastDonationDate).toISOString().slice(0, 10)
		: null;
	const eligibility = getEligibility(lastDonationDate);
	const walletData = user?.wallet;
	const completedCount = walletData?.lifetimeDonations ?? 0;

	const openedAlertIds = useRef<Set<string>>(new Set());

	const requests: EmergencyMatchRequest[] = (alerts?.alerts ?? [])
		.filter(
			(a: { request: { status: string } }) =>
				a.request.status === "pending" ||
				a.request.status === "matched",
		)
		.map(
			(a: {
				id: string;
				request: {
					hospital: { name: string; location: string | null };
					bloodGroup: string;
					unitsNeeded: number;
					urgencyLevel: string;
					createdAt: Date;
					status: string;
				};
				status: string;
			}) => ({
				id: a.id,
				hospitalName: a.request.hospital.name,
				location: a.request.hospital.location ?? "Unknown",
				bloodType: displayBloodGroup(a.request.bloodGroup),
				requiredPints: a.request.unitsNeeded,
				contactPhone: "N/A",
				urgency:
					a.request.urgencyLevel === "critical"
						? ("critical" as const)
						: ("high" as const),
				timestamp: new Date(a.request.createdAt).toISOString(),
				status: a.request.status as "pending" | "matched" | "completed",
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

	const deferralPercent = Math.min(
		100,
		Math.floor(
			((ELIGIBILITY_DAYS - eligibility.daysRemaining) /
				ELIGIBILITY_DAYS) *
				100,
		),
	);

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
		isSuccessModalOpen,
		setActiveTrackingId,
		handleRespond,
		handleDecline,
		handleMarkEnRoute,
		handleMarkArrived,
		handleManualComplete,
	} = useEmergencyMissionTracker(setLastDonationDateInput);

	const donationRecords = historyData?.records ?? [];
	const activeRequest = requests.find((r) => r.id === activeTrackingId);
	const isLoading = sessionLoading || userLoading;

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
					<EmergencyAlertsFeed
						requests={requests}
						bloodType={bloodType}
						eligibility={eligibility}
						donorStatus={donorStatus}
						donorAlertStatuses={donorAlertStatuses}
						activeTrackingId={activeTrackingId}
						onRespond={handleRespond}
						onDecline={handleDecline}
						onMarkEnRoute={handleMarkEnRoute}
						onMarkArrived={handleMarkArrived}
					/>

					<BloodSupplyChart banks={banks} bloodType={bloodType} />

					<DonationHistoryCard records={donationRecords} />
				</div>
			</motion.div>

			<SuccessModal
				isOpen={isSuccessModalOpen}
				completedCount={completedCount}
				onUpdateRecords={handleManualComplete}
			/>
		</motion.div>
	);
}
