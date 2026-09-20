"use client";

import {
	Bell,
	CheckCheck,
	CheckCircle2,
	ChevronRight,
	Clock,
	Droplet,
	ShieldCheck,
	UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type NotificationType =
	| "blood_request"
	| "status_update"
	| "eligibility_reminder"
	| "account_notification";

export type NotificationFilter = "all" | "unread" | "requests";

export interface DonorNotificationItem {
	id: string;
	type: NotificationType;
	title: string;
	description: string;
	timestamp: string;
	isRead: boolean;
	href?: string;
	actionLabel?: string;
	alertId?: string;
}

const FILTERS: { value: NotificationFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "unread", label: "Unread" },
	{ value: "requests", label: "Blood Requests" },
];

function TypeIcon({ type }: { type: NotificationType }) {
	if (type === "blood_request") {
		return (
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-destructive/25 bg-destructive/10 text-destructive">
				<Droplet className="h-4 w-4 fill-destructive" />
			</div>
		);
	}
	if (type === "status_update") {
		return (
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/10 text-sky-500">
				<CheckCircle2 className="h-4 w-4" />
			</div>
		);
	}
	if (type === "eligibility_reminder") {
		return (
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-status-ok/25 bg-status-ok-bg text-status-ok">
				<ShieldCheck className="h-4 w-4" />
			</div>
		);
	}
	return (
		<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
			<UserCheck className="h-4 w-4" />
		</div>
	);
}

interface NotificationsSectionProps {
	items: DonorNotificationItem[];
	filter: NotificationFilter;
	onFilterChange: (filter: NotificationFilter) => void;
	unreadCount: number;
	onItemClick: (item: DonorNotificationItem) => void;
	onMarkAsRead: (item: DonorNotificationItem) => void;
	onMarkAllRead: () => void;
}

export function NotificationsSection({
	items,
	filter,
	onFilterChange,
	unreadCount,
	onItemClick,
	onMarkAsRead,
	onMarkAllRead,
}: NotificationsSectionProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-end justify-between border-b border-border pb-4">
				<div>
					<h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
						Notifications
					</h1>
					<p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
						Blood request alerts and important account updates.
					</p>
				</div>
				<div className="flex items-center gap-2">
					{unreadCount > 0 && (
						<>
							<Badge
								variant="destructive"
								className="flex items-center gap-1.5"
							>
								<span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
								<span>{unreadCount} unread</span>
							</Badge>
							<Button
								variant="ghost"
								size="sm"
								onClick={onMarkAllRead}
								className="text-xs"
							>
								<CheckCheck className="h-3.5 w-3.5 text-destructive" />
								<span className="hidden sm:inline">Mark all as read</span>
							</Button>
						</>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2 text-xs">
				{FILTERS.map((f) => (
					<Button
						key={f.value}
						variant={filter === f.value ? "secondary" : "ghost"}
						size="sm"
						onClick={() => onFilterChange(f.value)}
						className={cn(
							"h-8 rounded-lg px-3 py-1.5 text-xs font-semibold",
							filter !== f.value && "text-muted-foreground",
						)}
					>
						<span>{f.label}</span>
						{f.value === "unread" && unreadCount > 0 && (
							<span className="h-1.5 w-1.5 rounded-full bg-destructive" />
						)}
					</Button>
				))}
			</div>

			{items.length > 0 ? (
				<div className="space-y-3">
					{items.map((item) => (
						<Card
							key={item.id}
							onClick={() => onItemClick(item)}
							className={cn(
								"group relative cursor-pointer p-0 transition-colors",
								item.isRead
									? "hover:border-muted-foreground/30"
									: "border-destructive/25 hover:border-destructive/40",
							)}
						>
							<CardContent className="p-4 sm:p-5">
								<div className="flex items-start gap-3.5">
									<TypeIcon type={item.type} />
									<div className="min-w-0 flex-1 space-y-1.5">
										<div className="flex items-center justify-between gap-2">
											<div className="flex min-w-0 items-center gap-2">
												{!item.isRead && (
													<span
														title="Unread"
														className="h-2 w-2 shrink-0 rounded-full bg-destructive"
													/>
												)}
												<h2
													className={cn(
														"truncate text-sm font-semibold",
														item.isRead && "text-muted-foreground",
													)}
												>
													{item.title}
												</h2>
											</div>
											<span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground">
												<Clock className="h-3 w-3" />
												{item.timestamp}
											</span>
										</div>
										<p className="text-xs leading-relaxed text-muted-foreground">
											{item.description}
										</p>
										{item.actionLabel && (
											<div className="flex items-center justify-between pt-2">
												<span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive transition-colors group-hover:text-destructive/80">
													{item.actionLabel}
													<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
												</span>
												{!item.isRead && item.alertId && (
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															onMarkAsRead(item);
														}}
														className="cursor-pointer text-[11px] text-muted-foreground transition-colors hover:text-foreground"
													>
														Mark as read
													</button>
												)}
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card className="border-dashed text-center">
					<CardContent className="space-y-3 p-10 sm:p-14">
						<div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
							<Bell className="h-6 w-6" />
						</div>
						<h2 className="text-base font-bold sm:text-lg">
							No notifications yet.
						</h2>
						<p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground sm:text-sm">
							You&apos;ll be notified when urgent blood requests or account
							updates occur.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
