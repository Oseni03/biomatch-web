"use client";

import { HeartHandshake } from "lucide-react";
import type { EmergencyMatchRequest } from "@/lib/donor-types";
import { EmergencyRequestCard } from "@/components/donor/urgent-request-card";
import {
	EmptyState,
	SectionHeading,
	type CardHandlers,
} from "@/components/donor/dashboard-shared";

export function ResponsesSection({
	responses,
	statuses,
	trackedId,
	handlers,
}: {
	responses: EmergencyMatchRequest[];
	statuses: Record<string, string>;
	trackedId: string | null;
	handlers: CardHandlers;
}) {
	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between border-b border-border pb-1">
				<SectionHeading>
					<HeartHandshake className="h-4 w-4 text-status-ok" />
					My Emergency Responses
				</SectionHeading>
			</div>
			{responses.length > 0 ? (
				responses.map((response) => (
					<EmergencyRequestCard
						key={response.id}
						request={response}
						alertStatus={statuses[response.id]}
						isTracked={trackedId === response.id}
						{...handlers}
					/>
				))
			) : (
				<EmptyState
					icon={HeartHandshake}
					title="No active emergency responses."
					description="When you accept an urgent blood request, your dispatch details and hospital directions will appear here."
				/>
			)}
		</section>
	);
}
