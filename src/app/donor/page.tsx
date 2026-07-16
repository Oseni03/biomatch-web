"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { useDonorHistory } from "@/hooks/use-donor-history";
import { getAllHospitalBanks } from "@/servers/hospital";
import { getAllCityLabels } from "@/servers/location";
import { updateUserProfile } from "@/servers/user";
import { respondToAlert, updateAlertStatus, markAlertOpened } from "@/servers/emergency";
import { getEligibility } from "@/lib/eligibility";
import { ELIGIBILITY_DAYS } from "@/lib/constants";
import {
	displayBloodGroup,
	type EmergencyMatchRequest,
	type DonorStatus,
} from "@/lib/donor-types";
import { useDonorAlerts } from "@/hooks/use-emergency-requests";
import { toast } from "sonner";

import { AlertCountProvider } from "@/lib/alert-context";
import { ActiveMissionTracker } from "@/components/donor/active-mission-tracker";
import { DeferralStatusCard } from "@/components/donor/deferral-status-card";
import { LocationSettingsCard } from "@/components/donor/location-settings-card";
import { EmergencyAlertsFeed } from "@/components/donor/emergency-alerts-feed";
import { BloodSupplyChart } from "@/components/donor/blood-supply-chart";
import { DonationHistoryCard } from "@/components/donor/donation-history-card";
import { SuccessModal } from "@/components/donor/success-modal";

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
	const { data: alerts } = useDonorAlerts(session?.user?.id);
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
	// const points = walletData?.points ?? 0;

	const [donorStatus, setDonorStatus] = useState<DonorStatus>("available");
	const [donorLocation, setDonorLocation] = useState<string>(
		user?.location || "",
	);
	const [maxRadius, setMaxRadius] = useState<number>(15);
	const [smsFallbackEnabled, setSmsFallbackEnabled] = useState<boolean>(true);
	const openedAlertIds = useRef<Set<string>>(new Set());
	const [settingsSuccess, setSettingsSuccess] = useState<string>("");
	const [lastDonationDateInput, setLastDonationDateInput] = useState<string>(
		lastDonationDate ?? "",
	);

	const requests: EmergencyMatchRequest[] = (alerts ?? [])
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
	const declinedRequestIds: string[] = [];
	for (const a of alerts ?? []) {
		donorAlertStatuses[a.id] = a.status;
		if (a.status === "declined") {
			declinedRequestIds.push(a.id);
		}
	}

	const activeAlertCount = (alerts ?? []).filter(
		(a: { status: string }) =>
			a.status === "alerted" ||
			a.status === "accepted" ||
			a.status === "en_route",
	).length;

	useEffect(() => {
		if (user?.location) setDonorLocation(user.location);
		if (lastDonationDate) setLastDonationDateInput(lastDonationDate);
		if (user?.isActive === false) setDonorStatus("inactive");
	}, [user, lastDonationDate]);

	useEffect(() => {
		for (const a of alerts ?? []) {
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

	const queryClient = useQueryClient();

	const handleSaveSettings = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!session?.user?.id) return;
			try {
				await updateUserProfile(session.user.id, {
					location: donorLocation || undefined,
					isActive: donorStatus !== "inactive",
					lastDonationDate: lastDonationDateInput
						? new Date(lastDonationDateInput)
						: undefined,
				});
				setSettingsSuccess(
					"Preferences updated successfully! Match filters updated in real-time.",
				);
				setTimeout(() => setSettingsSuccess(""), 4000);
				queryClient.invalidateQueries({
					queryKey: ["donor-dashboard"],
				});
				toast.success("Settings saved");
			} catch {
				toast.error("Failed to save settings");
			}
		},
		[
			session?.user?.id,
			donorLocation,
			donorStatus,
			lastDonationDateInput,
			queryClient,
		],
	);

	const [activeTrackingId, setActiveTrackingId] = useState<string | null>(
		null,
	);
	const [trackingStatus, setTrackingStatus] = useState<
		"accepted" | "en_route" | "arrived"
	>("accepted");
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

	const handleRespond = useCallback(
		async (reqId: string) => {
			setActiveTrackingId(reqId);
			setTrackingStatus("accepted");
			try {
				await respondToAlert(reqId, "accepted");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
			} catch {
				toast.error("Failed to accept alert");
			}
		},
		[queryClient],
	);

	const handleDecline = useCallback(
		async (reqId: string) => {
			try {
				await respondToAlert(reqId, "declined");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
				toast.success("Alert declined");
			} catch {
				toast.error("Failed to decline alert");
			}
		},
		[queryClient],
	);

	const handleMarkEnRoute = useCallback(
		async (reqId: string) => {
			try {
				await updateAlertStatus(reqId, "en_route");
				setTrackingStatus("en_route");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
				toast.success("Marked as en route");
			} catch {
				toast.error("Failed to update status");
			}
		},
		[queryClient],
	);

	const handleMarkArrived = useCallback(
		async (reqId: string) => {
			try {
				await updateAlertStatus(reqId, "arrived");
				setTrackingStatus("arrived");
				setIsSuccessModalOpen(true);
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
			} catch {
				toast.error("Failed to update status");
			}
		},
		[queryClient],
	);

	const handleManualComplete = useCallback(async () => {
		if (activeTrackingId) {
			try {
				await updateAlertStatus(activeTrackingId, "completed");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
				queryClient.invalidateQueries({
					queryKey: ["donor-dashboard"],
				});
			} catch {
				toast.error("Failed to update donation status");
			}
		}
		setActiveTrackingId(null);
		setIsSuccessModalOpen(false);
		const today = new Date().toISOString().split("T")[0];
		setLastDonationDateInput(today);
		toast.success("Donation recorded. Deferral period reset.");
	}, [activeTrackingId, queryClient]);

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
		<AlertCountProvider value={activeAlertCount}>
			<motion.div
				className="space-y-8"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{eligibility.eligible && lastDonationDate && (
					<motion.div variants={itemVariants}>
						<div className="bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/50 rounded-2xl p-4 flex items-center gap-3">
							<CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
							<div>
								<p className="text-sm font-semibold text-green-800 dark:text-green-300">
									You are eligible to donate again!
								</p>
								<p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
									Your 56-day deferral period has ended. Check
									for active emergency requests above.
								</p>
							</div>
						</div>
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
		</AlertCountProvider>
	);
}
