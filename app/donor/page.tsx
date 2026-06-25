"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { getAllHospitalBanks } from "@/servers/hospital";
import { updateUserProfile } from "@/servers/user";
import { getEligibility, ELIGIBILITY_DAYS } from "@/lib/eligibility";
import {
	displayBloodGroup,
	HOSPITALS_FOR_HISTORY,
	type EmergencyMatchRequest,
	type DonationRecord,
	type DonorStatus,
} from "@/lib/donor-types";
import { useDonorAlerts } from "@/hooks/use-emergency-requests";
import { respondToAlert, updateAlertStatus } from "@/servers/emergency";
import { toast } from "sonner";

import { ActiveMissionTracker } from "@/components/donor/active-mission-tracker";
import { DeferralStatusCard } from "@/components/donor/deferral-status-card";
import { HmoInsuranceCard } from "@/components/donor/hmo-insurance-card";
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

	const bloodType = displayBloodGroup(user?.bloodGroup);
	const lastDonationDate = user?.lastDonationDate
		? new Date(user.lastDonationDate).toISOString().slice(0, 10)
		: null;
	const eligibility = getEligibility(lastDonationDate);
	const walletData = user?.wallet;
	const completedCount = walletData?.lifetimeDonations ?? 0;
	const points = walletData?.points ?? 0;

	const [donorStatus, setDonorStatus] = useState<DonorStatus>("available");
	const [donorLocation, setDonorLocation] = useState<string>(
		user?.location || "Ikeja, Lagos",
	);
	const [maxRadius, setMaxRadius] = useState<number>(15);
	const [smsFallbackEnabled, setSmsFallbackEnabled] = useState<boolean>(true);
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
				status: a.request.status as "pending" | "matched",
			}),
		);

	const donorApprovedRequests = (alerts ?? [])
		.filter(
			(a: { status: string }) =>
				a.status === "accepted" ||
				a.status === "en_route" ||
				a.status === "arrived" ||
				a.status === "completed",
		)
		.map((a: { id: string }) => a.id);

	const [activeTrackingId, setActiveTrackingId] = useState<string | null>(
		null,
	);
	const [trackingProgress, setTrackingProgress] = useState(0);
	const [trackingStatus, setTrackingStatus] = useState<
		"accepted" | "en_route" | "arrived"
	>("accepted");
	const [etaMinutes, setEtaMinutes] = useState(15);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [completedCountLocal, setCompletedCountLocal] =
		useState(completedCount);

	useEffect(() => {
		if (user?.location) setDonorLocation(user.location);
		if (lastDonationDate) setLastDonationDateInput(lastDonationDate);
		if (user?.isActive === false) setDonorStatus("inactive");
	}, [user, lastDonationDate]);

	useEffect(() => {
		setCompletedCountLocal(completedCount);
	}, [completedCount]);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (activeTrackingId) {
			timer = setInterval(() => {
				setTrackingProgress((prev) => {
					if (prev >= 100) {
						clearInterval(timer);
						setTrackingStatus("arrived");
						setEtaMinutes(0);
						setIsSuccessModalOpen(true);
						return 100;
					}
					const next = prev + 5;
					if (next >= 15 && next < 80) {
						setTrackingStatus("en_route");
						setEtaMinutes(
							Math.max(1, Math.round(15 * (1 - next / 100))),
						);
					} else if (next >= 80) {
						setTrackingStatus("arrived");
						setEtaMinutes(0);
					}
					return next;
				});
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [activeTrackingId]);

	const deferralPercent = Math.min(
		100,
		Math.floor(
			((ELIGIBILITY_DAYS - eligibility.daysRemaining) /
				ELIGIBILITY_DAYS) *
				100,
		),
	);

	const getHmoTier = useCallback(() => {
		if (completedCountLocal === 0)
			return {
				name: "Inactive",
				level: 0,
				desc: "Donate once to activate your Basic coverage",
			};
		if (completedCountLocal < 3)
			return {
				name: "Basic Plan Activated",
				level: 1,
				desc: "Covers standard consultation and primary emergencies",
			};
		return {
			name: "Premium Gold Plan",
			level: 2,
			desc: "Covers comprehensive surgeries, medication, and fully upgraded HMO coverage",
		};
	}, [completedCountLocal]);

	const hmoTier = getHmoTier();

	const queryClient = useQueryClient();

	const handleSaveSettings = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!session?.user?.id) return;
			try {
				await updateUserProfile(session.user.id, {
					location: donorLocation || undefined,
					isActive: donorStatus !== "inactive",
				});
				setSettingsSuccess(
					"Preferences updated successfully! Match filters updated in real-time.",
				);
				setTimeout(() => setSettingsSuccess(""), 4000);
				toast.success("Settings saved");
			} catch {
				toast.error("Failed to save settings");
			}
		},
		[session?.user?.id, donorLocation, donorStatus],
	);

	const handleRespond = useCallback(
		async (reqId: string) => {
			setActiveTrackingId(reqId);
			setTrackingProgress(0);
			setTrackingStatus("accepted");
			setEtaMinutes(15);
			try {
				await respondToAlert(reqId, "accepted");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
			} catch {
				toast.error("Failed to accept alert");
			}
		},
		[queryClient],
	);

	const handleManualComplete = useCallback(async () => {
		if (activeTrackingId) {
			try {
				await updateAlertStatus(activeTrackingId, "completed");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
			} catch {
				toast.error("Failed to update donation status");
			}
		}
		setCompletedCountLocal((prev) => prev + 1);
		setActiveTrackingId(null);
		setTrackingProgress(0);
		const today = new Date().toISOString().split("T")[0];
		setLastDonationDateInput(today);
		setIsSuccessModalOpen(false);
		toast.success("Donation recorded. Deferral period reset.");
	}, [activeTrackingId, queryClient]);

	const generateHistory = useCallback((): DonationRecord[] => {
		const list: DonationRecord[] = [];
		for (let i = 0; i < completedCountLocal; i++) {
			const dateOffset = (i + 1) * 60;
			const date = new Date();
			date.setDate(date.getDate() - dateOffset);
			list.push({
				id: `rec-${i}`,
				date: date.toISOString().split("T")[0],
				hospitalName:
					HOSPITALS_FOR_HISTORY[i % HOSPITALS_FOR_HISTORY.length],
				bloodType,
				status: "verified",
				pints: 1,
			});
		}
		return list;
	}, [completedCountLocal, bloodType]);

	const donationRecords = generateHistory();
	const activeRequest = requests.find((r) => r.id === activeTrackingId);
	const isLoading = sessionLoading || userLoading;

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-gray-400" />
			</div>
		);
	}

	if (userError) {
		toast.error("Failed to load dashboard data");
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-gray-500">
				Sign in to view the donor dashboard
			</p>
		);
	}

	return (
		<div className="space-y-8">
			{activeTrackingId && activeRequest && (
				<ActiveMissionTracker
					request={activeRequest}
					trackingStatus={trackingStatus}
					trackingProgress={trackingProgress}
					etaMinutes={etaMinutes}
					donorLocation={donorLocation}
					onAbort={() => {
						setActiveTrackingId(null);
						setTrackingProgress(0);
					}}
					onSimulateArrival={() => setTrackingProgress(100)}
				/>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="space-y-8 lg:col-span-1">
					<DeferralStatusCard
						eligibility={eligibility}
						lastDonationDate={lastDonationDate}
						lastDonationDateInput={lastDonationDateInput}
						onDateChange={setLastDonationDateInput}
						deferralPercent={deferralPercent}
					/>

					<HmoInsuranceCard
						userName={session.user.name ?? "BioMatch User"}
						userId={user?.id ?? ""}
						completedCount={completedCountLocal}
						hmoTier={hmoTier}
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
					/>
				</div>

				<div className="space-y-8 lg:col-span-2">
					<EmergencyAlertsFeed
						requests={requests}
						bloodType={bloodType}
						eligibility={eligibility}
						donorStatus={donorStatus}
						donorApprovedRequests={donorApprovedRequests}
						activeTrackingId={activeTrackingId}
						onRespond={handleRespond}
					/>

					<BloodSupplyChart banks={banks} bloodType={bloodType} />

					<DonationHistoryCard records={donationRecords} />
				</div>
			</div>

			<SuccessModal
				isOpen={isSuccessModalOpen}
				completedCount={completedCountLocal}
				onUpdateRecords={handleManualComplete}
			/>
		</div>
	);
}
