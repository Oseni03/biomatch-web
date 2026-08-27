"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
	useDonorAlerts,
	useDonorConfirmDonation,
} from "@/hooks/use-emergency-requests";
import { useEmergencyMissionTracker } from "@/hooks/use-emergency-mission-tracker";
import { toast } from "sonner";

import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { ActiveMissionTracker } from "@/components/donor/active-mission-tracker";
import { EmergencyAlertsFeed } from "@/components/donor/emergency-alerts-feed";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function DonorDashboardClient() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useDonorDashboard();
	const [page, setPage] = useState(1);

	const { data: alerts } = useDonorAlerts(session?.user?.id, {
		page,
		pageSize: 10,
	});

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

			{alerts && alerts.totalPages > 1 && (
				<PaginationControls
					page={page}
					totalPages={alerts.totalPages}
					onPageChange={setPage}
					variant="numbered"
				/>
			)}
		</div>
	);
}
