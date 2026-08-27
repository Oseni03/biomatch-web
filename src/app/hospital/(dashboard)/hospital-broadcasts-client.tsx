"use client";

import { useState } from "react";
import { EmergencyRequestForm } from "@/components/hospital/emergency-request-form";
import { LiveStatusPanel } from "@/components/hospital/live-status-panel";
import {
	usePendingEmergencyRequests,
} from "@/hooks/use-emergency-requests";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

interface HospitalBroadcastsClientProps {
	organizationId: string;
}

export function HospitalBroadcastsClient({
	organizationId,
}: HospitalBroadcastsClientProps) {
	const [page, setPage] = useState(1);
	const { data: pendingRequests } = usePendingEmergencyRequests(
		organizationId,
		{
			page,
			pageSize: 10,
		},
	);

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Emergency Broadcast Center"
				subtitle="Create and manage emergency blood requests"
			/>

			<EmergencyRequestForm organizationId={organizationId} />

			{pendingRequests?.requests.map((req) => (
				<LiveStatusPanel key={req.id} request={req} organizationId={organizationId} />
			))}

			{pendingRequests && pendingRequests.totalPages > 1 && (
				<PaginationControls
					page={page}
					totalPages={pendingRequests.totalPages}
					onPageChange={setPage}
					variant="numbered"
				/>
			)}
		</div>
	);
}
