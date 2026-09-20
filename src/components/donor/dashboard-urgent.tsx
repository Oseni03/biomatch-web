"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import type { EmergencyMatchRequest } from "@/lib/donor-types";
import { cn } from "@/lib/utils";
import { EmergencyRequestCard } from "@/components/donor/urgent-request-card";
import {
	EmptyState,
	SectionHeading,
	type CardHandlers,
} from "@/components/donor/dashboard-shared";

export function UrgentSection({
	hero,
	heroStatus,
	trackedId,
	handlers,
	onRefresh,
	refreshing,
}: {
	hero: EmergencyMatchRequest | null;
	heroStatus: string | undefined;
	trackedId: string | null;
	handlers: CardHandlers;
	onRefresh: () => void;
	refreshing: boolean;
}) {
	return (
		<section className="space-y-3.5">
			<div className="flex items-center justify-between">
				<SectionHeading>
					<span className="h-2 w-2 animate-pulse rounded-full bg-status-critical" />
					Urgent Request Near You
				</SectionHeading>
				{!hero && (
					<button
						type="button"
						onClick={onRefresh}
						disabled={refreshing}
						className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
					>
						<RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
						<span>Check for requests</span>
					</button>
				)}
			</div>
			{hero ? (
				<EmergencyRequestCard
					request={hero}
					alertStatus={heroStatus}
					isTracked={trackedId === hero.id}
					{...handlers}
				/>
			) : (
				<EmptyState
					icon={CheckCircle2}
					iconClassName="text-status-ok"
					title="No urgent requests near you."
					description="We'll notify you when a relevant request is available."
				/>
			)}
		</section>
	);
}
