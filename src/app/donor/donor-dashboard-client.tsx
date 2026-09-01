"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { markAlertOpened } from "@/servers/emergency";
import { getEligibility } from "@/lib/eligibility";
import {
	displayBloodGroup,
	type EmergencyMatchRequest,
} from "@/lib/donor-types";
import {
	useCompatibleEmergencyRequests,
	useDonorConfirmDonation,
} from "@/hooks/use-emergency-requests";
import { useEmergencyMissionTracker } from "@/hooks/use-emergency-mission-tracker";
import { toast } from "sonner";

import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { ActiveMissionTracker } from "@/components/donor/active-mission-tracker";
import { EmergencyAlertsFeed } from "@/components/donor/emergency-alerts-feed";
import { ProfileIncompleteBanner } from "@/components/donor/profile-incomplete-banner";
import { ProfileCompleteModal } from "@/components/donor/profile-complete-modal";
import { PaginationControls } from "@/components/ui/pagination-controls";

function checkProfileIncomplete(user: unknown): boolean {
	if (!user || typeof user !== "object") return true;
	const u = user as Record<string, unknown>;
	const health = (u.updatedHealthInfo ?? {}) as Record<string, unknown>;
	const requiredHealthKeys = ["height_cm", "weight_kg", "blood_pressure", "resting_heart_rate"] as const;
	const hasRequiredHealth = requiredHealthKeys.every((key) => {
		const value = health[key];
		return typeof value === "string"
			? value.trim().length > 0
			: value != null && String(value).trim().length > 0;
	});
	const name = typeof u.name === "string" ? u.name : "";
	const location = typeof u.location === "string" ? u.location : "";
	return !(
		name.trim() &&
		u.bloodGroup &&
		location.trim() &&
		u.availability &&
		hasRequiredHealth
	);
}

export function DonorDashboardClient() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useDonorDashboard();
	const [page, setPage] = useState(1);
	const [profileModalOpen, setProfileModalOpen] = useState(false);

	const { data: compatible } = useCompatibleEmergencyRequests(
		session?.user?.id,
		{ page, pageSize: 10 },
	);

	const lastDonationDate = user?.lastDonationDate
		? new Date(user.lastDonationDate).toISOString().slice(0, 10)
		: null;
	const eligibility = getEligibility(lastDonationDate);
	const walletData = user?.wallet;
	const completedCount = walletData?.lifetimeDonations ?? 0;

	const openedAlertIds = useRef<Set<string>>(new Set());

	useEffect(() => {
		for (const r of compatible?.requests ?? []) {
			const alertId = r.id;
			const alertStatus = r.alertStatus;
			if (alertStatus === "alerted" && !openedAlertIds.current.has(alertId)) {
				openedAlertIds.current.add(alertId);
				markAlertOpened(alertId).catch(() => {});
			}
		}
	}, [compatible]);

	const requests = useMemo<EmergencyMatchRequest[]>(
		() =>
			(compatible?.requests ?? [])
				.filter(
					(r) =>
						r.status === "pending" || r.status === "matched",
				)
				.map((r) => ({
					id: r.id,
					hospitalName: r.hospitalName,
					location: r.location,
					bloodType: displayBloodGroup(r.bloodType),
					requiredPints: r.requiredPints,
					contactPhone: "N/A",
					urgency: r.urgency,
					timestamp: r.timestamp,
					status: r.status as "pending" | "matched" | "completed",
					donorConfirmedAt: r.donorConfirmedAt,
				})),
		[compatible],
	);

	const donorAlertStatuses: Record<string, string> = {};
	for (const r of compatible?.requests ?? []) {
		if (r.alertStatus) {
			donorAlertStatuses[r.id] = r.alertStatus;
		}
	}

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

	const activeRequest = requests.find((r) => r.id === activeTrackingId);
	const isLoading = sessionLoading || userLoading;

	const isProfileIncomplete = useMemo(
		() => checkProfileIncomplete(user),
		[user],
	);

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

	return (
		<>
			<div className="space-y-8">
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

				{isProfileIncomplete && (
					<ProfileIncompleteBanner onClick={() => setProfileModalOpen(true)} />
				)}

				{activeTrackingId && activeRequest && (
					<ActiveMissionTracker
						request={activeRequest}
						trackingStatus={trackingStatus}
						donorLocation={user?.location ?? ""}
						onAbort={() => {
							setActiveTrackingId(null);
						}}
						onSimulateArrival={() =>
							trackingStatus === "accepted"
								? handleMarkEnRoute(activeTrackingId)
								: handleMarkArrived(activeTrackingId)
						}
					/>
				)}

				<EmergencyAlertsFeed
					requests={requests}
					bloodType={displayBloodGroup(user?.bloodGroup)}
					eligibility={eligibility}
					donorStatus={user?.isActive ? "available" : "inactive"}
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

				{compatible && compatible.totalPages > 1 && (
					<PaginationControls
						page={page}
						totalPages={compatible.totalPages}
						onPageChange={setPage}
						variant="numbered"
					/>
				)}
			</div>

			<ProfileCompleteModal
				isOpen={profileModalOpen}
				onClose={() => setProfileModalOpen(false)}
				userId={session.user.id}
				role={session.user.role as "donor" | "hospital" | "admin"}
			/>
		</>
	);
}
