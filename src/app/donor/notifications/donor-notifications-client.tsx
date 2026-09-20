"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { useDonorAlerts } from "@/hooks/use-emergency-requests";
import { markAlertOpened } from "@/servers/emergency";
import { getEligibility } from "@/lib/eligibility";
import { displayBloodGroup, type DonorAlertWithRequest } from "@/lib/donor-types";
import {
	formatNextEligibleDate,
	hasIncompleteProfile,
	nextDonationCopy,
} from "@/lib/donor-dashboard";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
	NotificationsSection,
	type DonorNotificationItem,
	type NotificationFilter,
} from "@/components/donor/notifications-section";

function formatRelative(date: Date): string {
	const diffMs = Date.now() - date.getTime();
	const minutes = Math.floor(diffMs / 60000);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
	return date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

type AlertItem = DonorAlertWithRequest["alerts"][number];

interface RankedNotification extends DonorNotificationItem {
	sortKey: number;
}

function buildAlertItem(alert: AlertItem): RankedNotification {
	const blood = displayBloodGroup(alert.request.bloodGroup);
	const hospitalName = alert.request.organization?.name ?? "Unknown hospital";
	const location =
		alert.request.organization?.hospitalBanks[0]?.location ?? "Unknown location";
	const isRead = alert.openedAt != null;

	if (
		alert.status === "alerted" &&
		(alert.request.status === "pending" || alert.request.status === "matched")
	) {
		return {
			id: alert.id,
			type: "blood_request",
			title: "Urgent blood request near you",
			description: `${blood} needed at ${hospitalName} (${location}).`,
			timestamp: formatRelative(new Date(alert.createdAt)),
			sortKey: new Date(alert.createdAt).getTime(),
			isRead,
			href: "/donor",
			actionLabel: "View Request Details",
			alertId: alert.id,
		};
	}

	const updatedAt = new Date(alert.respondedAt ?? alert.updatedAt);
	const base = {
		id: alert.id,
		type: "status_update" as const,
		timestamp: formatRelative(updatedAt),
		sortKey: updatedAt.getTime(),
		isRead,
		alertId: alert.id,
	};

	if (alert.status === "completed") {
		return {
			...base,
			title: "Donation completed",
			description: `Your ${blood} donation at ${hospitalName} was confirmed. Thank you for saving lives.`,
			href: "/donor/history",
			actionLabel: "View History",
		};
	}
	if (alert.status === "accepted") {
		return {
			...base,
			title: "Response confirmed",
			description: `You accepted the ${blood} request at ${hospitalName}. The hospital blood bank team has been notified.`,
			href: "/donor/responses",
			actionLabel: "Track Response",
		};
	}
	if (alert.status === "en_route") {
		return {
			...base,
			title: "You're on your way",
			description: `Your trip to ${hospitalName} for the ${blood} request is being tracked.`,
			href: "/donor/responses",
			actionLabel: "Track Response",
		};
	}
	if (alert.status === "arrived") {
		return {
			...base,
			title: "Arrival recorded",
			description: `Your arrival at ${hospitalName} was recorded. Confirm your donation after giving blood.`,
			href: "/donor/responses",
			actionLabel: "Track Response",
		};
	}
	if (alert.status === "declined") {
		return {
			...base,
			title: "Request declined",
			description:
				alert.responseReason ??
				`You declined the ${blood} request at ${hospitalName}.`,
			href: "/donor",
			actionLabel: "View Open Requests",
		};
	}
	if (alert.status === "withdrawn") {
		return {
			...base,
			title: "Response withdrawn",
			description:
				alert.responseReason ??
				`You withdrew from the ${blood} request at ${hospitalName}.`,
			href: "/donor",
			actionLabel: "View Open Requests",
		};
	}
	if (alert.request.status === "fulfilled") {
		return {
			...base,
			title: "Request status updated",
			description: `The ${blood} request at ${hospitalName} has reached fulfilled donor capacity.`,
			href: "/donor",
			actionLabel: "View Details",
		};
	}
	if (alert.request.status === "expired" || alert.request.status === "cancelled") {
		return {
			...base,
			title: "Request no longer active",
			description: `The ${blood} request at ${hospitalName} is ${alert.request.status}.`,
			href: "/donor",
			actionLabel: "View Open Requests",
		};
	}
	return {
		...base,
		title: "Request status updated",
		description: `The ${blood} request at ${hospitalName} was updated.`,
		href: "/donor",
		actionLabel: "View Details",
	};
}

export function DonorNotificationsClient() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const { data: user, isLoading: userLoading } = useDonorDashboard();
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<NotificationFilter>("all");

	const { data: alerts, isLoading: alertsLoading } = useDonorAlerts(
		session?.user?.id,
		{ page, pageSize: 10 },
	);

	const items = useMemo(() => {
		const alertItems = (alerts?.alerts ?? []).map(buildAlertItem);
		alertItems.sort((a, b) => {
			if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
			return b.sortKey - a.sortKey;
		});

		if (page !== 1) return alertItems;

		const derived: DonorNotificationItem[] = [];
		const lastDonationDate = user?.lastDonationDate
			? new Date(user.lastDonationDate).toISOString().slice(0, 10)
			: null;
		const eligibility = getEligibility(lastDonationDate);
		const nextEligibleLabel = user?.lastDonationDate
			? formatNextEligibleDate(new Date(user.lastDonationDate))
			: null;
		derived.push({
			id: "eligibility",
			type: "eligibility_reminder",
			title: eligibility.eligible
				? "You're eligible to donate"
				: `Eligible again ${nextEligibleLabel ?? "soon"}`,
			description: nextDonationCopy(eligibility, nextEligibleLabel),
			timestamp: "Ongoing",
			isRead: true,
			href: "/donor",
			actionLabel: "View Eligibility",
		});
		if (hasIncompleteProfile(user)) {
			derived.push({
				id: "profile",
				type: "account_notification",
				title: "Complete your donor profile",
				description:
					"Finish your profile so hospitals can match you for urgent requests.",
				timestamp: "Action needed",
				isRead: false,
				href: "/donor/profile",
				actionLabel: "Complete Profile",
			});
		}
		return [...alertItems, ...derived];
	}, [alerts, user, page]);

	const filtered = useMemo(() => {
		if (filter === "unread") return items.filter((item) => !item.isRead);
		if (filter === "requests")
			return items.filter(
				(item) => item.type === "blood_request" || item.type === "status_update",
			);
		return items;
	}, [items, filter]);

	const unreadCount = items.filter((item) => !item.isRead).length;

	if (sessionLoading || userLoading || alertsLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">
				Sign in to view your notifications
			</p>
		);
	}

	const refresh = () =>
		queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });

	const markRead = async (item: DonorNotificationItem) => {
		if (item.alertId && !item.isRead) {
			await markAlertOpened(item.alertId).catch(() => {});
			await refresh();
		}
	};

	const handleItemClick = async (item: DonorNotificationItem) => {
		await markRead(item);
		if (item.href) router.push(item.href);
	};

	const handleMarkAllRead = async () => {
		await Promise.allSettled(
			items
				.filter((item) => item.alertId && !item.isRead)
				.map((item) => markAlertOpened(item.alertId!)),
		);
		await refresh();
	};

	return (
		<div className="mx-auto w-full max-w-4xl">
			<NotificationsSection
				items={filtered}
				filter={filter}
				onFilterChange={setFilter}
				unreadCount={unreadCount}
				onItemClick={handleItemClick}
				onMarkAsRead={markRead}
				onMarkAllRead={handleMarkAllRead}
			/>

			{alerts && alerts.totalPages > 1 && (
				<div className="mt-6">
					<PaginationControls
						page={page}
						totalPages={alerts.totalPages}
						onPageChange={setPage}
						variant="numbered"
					/>
				</div>
			)}
		</div>
	);
}
