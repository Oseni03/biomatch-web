"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ACTIVE_ALERT_STATUSES } from "@/lib/constants";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { markAlertOpened } from "@/servers/emergency";
import { getEligibility } from "@/lib/eligibility";
import type { LegacyDonorSnapshot } from "@/lib/donor-types";
import { buildRequests } from "@/lib/donor-dashboard";
import {
	useDonorAlerts,
	useDonorConfirmDonation,
} from "@/hooks/use-emergency-requests";
import { useEmergencyMissionTracker } from "@/hooks/use-emergency-mission-tracker";
import { ResponsesSection } from "@/components/donor/dashboard-responses";
import type { CardHandlers } from "@/components/donor/dashboard-shared";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function DonorResponsesClient() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
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
				Sign in to view your emergency responses
			</p>
		);
	}

	const u = user as LegacyDonorSnapshot | null | undefined;
	const lastDonatedAt = u?.donorProfile?.lastDonatedAt ?? u?.lastDonationDate ?? null;
	const lastDonationDate = lastDonatedAt
		? new Date(lastDonatedAt).toISOString().slice(0, 10)
		: null;
	const eligibility = getEligibility(lastDonationDate);

	const myResponses = requests.filter((r) =>
		(ACTIVE_ALERT_STATUSES as readonly string[]).includes(donorAlertStatuses[r.id]),
	);

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
			<ResponsesSection
				responses={myResponses}
				statuses={donorAlertStatuses}
				trackedId={activeTrackingId}
				handlers={cardHandlers}
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
