"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { markAlertOpened } from "@/servers/emergency";
import { getEligibility } from "@/lib/eligibility";
import { displayBloodGroup, type LegacyDonorSnapshot } from "@/lib/donor-types";
import {
	buildRequests,
	formatNextEligibleDate,
	hasIncompleteProfile,
} from "@/lib/donor-dashboard";
import {
	useDonorAlerts,
	useDonorConfirmDonation,
} from "@/hooks/use-emergency-requests";
import { useEmergencyMissionTracker } from "@/hooks/use-emergency-mission-tracker";
import { EmergencyAlertsFeed } from "@/components/donor/emergency-alerts-feed";
import { ProfileIncompleteBanner } from "@/components/donor/profile-incomplete-banner";
import { DashboardHeader } from "@/components/donor/dashboard-header";
import { UrgentSection } from "@/components/donor/dashboard-urgent";
import { EligibilitySection } from "@/components/donor/dashboard-eligibility";
import { DonationRecordSection } from "@/components/donor/dashboard-record";
import type { CardHandlers } from "@/components/donor/dashboard-shared";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function DonorDashboardClient() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useDonorDashboard();
	const [page, setPage] = useState(1);

	const {
		data: alerts,
		refetch: refetchAlerts,
		isFetching: isFetchingAlerts,
	} = useDonorAlerts(session?.user?.id, { page, pageSize: 10 });

	const {
		activeTrackingId,
		handleRespond,
		handleDecline,
		handleWithdraw,
		handleMarkEnRoute,
		handleMarkArrived,
	} = useEmergencyMissionTracker();
	const donorConfirmDonation = useDonorConfirmDonation();
	const openedAlertIds = useRef<Set<string>>(new Set());

	useEffect(() => {
		for (const a of alerts?.alerts ?? []) {
			if (a.status === "alerted" && !openedAlertIds.current.has(a.id)) {
				openedAlertIds.current.add(a.id);
				markAlertOpened(a.id).catch(() => {});
			}
		}
	}, [alerts]);

	useEffect(() => {
		if (userError) toast.error("Failed to load dashboard data");
	}, [userError]);

	const { requests, donorAlertStatuses } = useMemo(() => {
		const list = buildRequests(alerts?.alerts ?? []);
		const statuses: Record<string, string> = {};
		for (const a of alerts?.alerts ?? []) statuses[a.id] = a.status;
		return { requests: list, donorAlertStatuses: statuses };
	}, [alerts]);

	const u = user as LegacyDonorSnapshot | null | undefined;
	const lastDonatedAt = u?.donorProfile?.lastDonatedAt ?? u?.lastDonationDate ?? null;
	const lastDonationDate = lastDonatedAt
		? new Date(lastDonatedAt).toISOString().slice(0, 10)
		: null;
	const eligibility = getEligibility(lastDonationDate);
	const lifetimeDonations = u?.donorProfile?.lifetimeDonations ?? u?.wallet?.lifetimeDonations ?? 0;
	const donorBloodGroup = displayBloodGroup(u?.donorProfile?.bloodGroup ?? u?.bloodGroup);
	const nextEligibleLabel = lastDonatedAt
		? formatNextEligibleDate(new Date(lastDonatedAt))
		: null;

	const actionable = requests.filter((r) => donorAlertStatuses[r.id] !== "declined");
	const heroRequest =
		actionable.find((r) => r.id === activeTrackingId) ?? actionable[0] ?? null;
	const feedRequests = requests.filter((r) => r.id !== heroRequest?.id);
	const showFeed =
		feedRequests.length > 0 &&
		(heroRequest !== null ||
			feedRequests.some((r) => donorAlertStatuses[r.id] !== "declined"));

	if (sessionLoading || userLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">
				Sign in to view the donor dashboard
			</p>
		);
	}

	const handleConfirmDonation = (alertId: string) => {
		donorConfirmDonation.mutate({ alertId, donorId: session.user.id });
	};

	const cardHandlers: CardHandlers = {
		eligibility,
		donorStatus: u?.donorProfile?.isAvailable ?? u?.isActive ?? true ? "available" : "inactive",
		onRespond: handleRespond,
		onDecline: handleDecline,
		onWithdraw: (reqId, reason) => handleWithdraw(reqId, session.user.id, reason),
		onMarkEnRoute: handleMarkEnRoute,
		onMarkArrived: handleMarkArrived,
		onConfirmDonation: handleConfirmDonation,
	};

	return (
		<div className="mx-auto w-full max-w-4xl space-y-8">
			<DashboardHeader name={session.user.name?.trim() || "Donor"} />

			{hasIncompleteProfile(user) && <ProfileIncompleteBanner />}

		<UrgentSection
			hero={heroRequest}
			heroStatus={
				heroRequest ? donorAlertStatuses[heroRequest.id] : undefined
			}
			trackedId={activeTrackingId}
			handlers={cardHandlers}
			onRefresh={() => refetchAlerts()}
			refreshing={isFetchingAlerts}
		/>

		<EligibilitySection
			eligibility={eligibility}
			nextEligibleLabel={nextEligibleLabel}
			bloodGroup={donorBloodGroup}
			hasBloodGroup={Boolean(u?.donorProfile?.bloodGroup ?? u?.bloodGroup)}
		/>
		<DonationRecordSection lifetimeDonations={lifetimeDonations} />

		{showFeed && (
			<EmergencyAlertsFeed
				requests={feedRequests}
				bloodType={donorBloodGroup}
				donorAlertStatuses={donorAlertStatuses}
				activeTrackingId={activeTrackingId}
				{...cardHandlers}
			/>
		)}

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
