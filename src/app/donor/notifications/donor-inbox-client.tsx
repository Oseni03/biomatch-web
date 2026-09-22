"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Droplet, Inbox } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
	useMarkNotificationRead,
	useNotificationInbox,
} from "@/hooks/use-donor-requests";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { NotificationPreferencesCard } from "@/components/donor/notification-preferences-card";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";

function formatRelative(date: Date): string {
	const target = new Date(date);
	const diffMs = Date.now() - target.getTime();
	const minutes = Math.floor(diffMs / 60000);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
	return target.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function DonorInboxClient() {
	const { data: session } = authClient.useSession();
	const donorId = session?.user?.id;
	const [page, setPage] = useState(1);
	const [unreadOnly, setUnreadOnly] = useState(false);
	const { data, isLoading } = useNotificationInbox(donorId, { page, pageSize: 20, unreadOnly });
	const markRead = useMarkNotificationRead(donorId);

	const notifications = data?.notifications ?? [];
	const unreadCount = data?.unreadCount ?? 0;

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Notifications"
				subtitle={
					unreadCount > 0
						? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
						: "Blood request alerts and donation updates land here."
				}
				action={
					unreadCount > 0 ? (
						<span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
							<Bell className="h-3 w-3" />
							{unreadCount} unread
						</span>
					) : undefined
				}
			/>

			<div className="flex gap-2">
				<Button
					size="sm"
					variant={!unreadOnly ? "default" : "outline"}
					className="rounded-xl"
					onClick={() => {
						setUnreadOnly(false);
						setPage(1);
					}}
				>
					All
				</Button>
				<Button
					size="sm"
					variant={unreadOnly ? "default" : "outline"}
					className="rounded-xl"
					onClick={() => {
						setUnreadOnly(true);
						setPage(1);
					}}
				>
					Unread
				</Button>
			</div>

			{isLoading ? (
				<div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
					Loading notifications…
				</div>
			) : notifications.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
					<Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-3 text-sm font-semibold text-foreground">
						{unreadOnly ? "No unread notifications" : "Your inbox is empty"}
					</p>
					<p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
						{unreadOnly
							? "You are all caught up. New alerts appear here as soon as a nearby hospital needs your blood type."
							: "When a nearby hospital needs your blood type, the alert appears here and in Requests Nearby."}
					</p>
					<Button asChild variant="outline" className="mt-4 rounded-2xl">
						<Link href="/donor/responses">View requests nearby</Link>
					</Button>
				</div>
			) : (
				<ul className="space-y-3">
					{notifications.map((notification) => (
						<li
							key={notification.id}
							className={`rounded-2xl border p-4 ${
								notification.readAt
									? "border-border bg-card"
									: "border-brand/30 bg-brand-light/40"
							}`}
						>
							<div className="flex items-start gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
									<Droplet className="h-4 w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-bold text-foreground">{notification.title}</p>
									<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
										{notification.body}
									</p>
									<p className="mt-1 text-[11px] text-muted-foreground">
										{formatRelative(notification.createdAt)}
									</p>
								</div>
								{!notification.readAt ? (
									<Button
										size="sm"
										variant="outline"
										className="shrink-0 rounded-xl"
										disabled={markRead.isPending}
										onClick={() => markRead.mutate(notification.id)}
									>
										<CheckCheck className="mr-1 h-3.5 w-3.5" />
										Mark read
									</Button>
								) : null}
							</div>
						</li>
					))}
				</ul>
			)}

			{(data?.totalPages ?? 1) > 1 && (
				<PaginationControls
					page={data!.page}
					totalPages={data!.totalPages}
					onPageChange={setPage}
				/>
			)}

			{notifications.length > 0 && (
				<p className="text-xs text-muted-foreground">
					Alerts show the blood type needed and the hospital name and location only.
				</p>
			)}

			<NotificationPreferencesCard />
		</div>
	);
}
