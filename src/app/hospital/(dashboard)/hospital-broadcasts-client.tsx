"use client";

import { useState } from "react";
import { Droplet } from "lucide-react";
import { EmergencyRequestForm } from "@/components/hospital/emergency-request-form";
import { LiveStatusPanel } from "@/components/hospital/live-status-panel";
import { RecentActivitySection } from "@/components/hospital/recent-activity-section";
import {
	usePendingEmergencyRequests,
} from "@/hooks/use-emergency-requests";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { getGreeting } from "@/lib/donor-dashboard";

interface HospitalBroadcastsClientProps {
	organizationId: string;
	hospitalName: string;
}

export function HospitalBroadcastsClient({
	organizationId,
	hospitalName,
}: HospitalBroadcastsClientProps) {
	const [page, setPage] = useState(1);
	const { data: pendingRequests } = usePendingEmergencyRequests(
		organizationId,
		{
			page,
			pageSize: 10,
		},
	);

	const requests = pendingRequests?.requests ?? [];

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title={`${getGreeting()}, ${hospitalName}`}
				subtitle="Connect with nearby screened blood donors during emergencies."
				action={<EmergencyRequestForm organizationId={organizationId} />}
			/>

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-bold text-foreground tracking-tight">
						Active Requests
					</h2>
					<span className="text-xs text-muted-foreground font-mono">
						{requests.length} open {requests.length === 1 ? "case" : "cases"}
					</span>
				</div>

				{requests.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
						<Droplet className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-60" />
						<h3 className="text-base font-semibold text-foreground">
							No active blood requests
						</h3>
						<p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
							When emergency surgery or transfusion is needed, launch a
							request to notify nearby screened donors.
						</p>
						<EmergencyRequestForm organizationId={organizationId} />
					</div>
				) : (
					<div className="space-y-3.5">
					{requests.map((req) => (
						<LiveStatusPanel key={req.id} request={req} />
					))}
					</div>
				)}
			</section>

			{pendingRequests && pendingRequests.totalPages > 1 && (
				<PaginationControls
					page={page}
					totalPages={pendingRequests.totalPages}
					onPageChange={setPage}
					variant="numbered"
				/>
			)}

			<RecentActivitySection organizationId={organizationId} />
		</div>
	);
}
