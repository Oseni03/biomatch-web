"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRequestHistory } from "@/hooks/use-hospital-requests";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";

function outcomeTone(status: string): "ok" | "low" | "info" {
	if (status === "fulfilled") return "ok";
	if (status === "cancelled") return "low";
	return "info";
}

export function RequestHistoryClient({ organizationId }: { organizationId: string }) {
	const { data: session } = authClient.useSession();
	const callerId = session?.user?.id;
	const [page, setPage] = useState(1);
	const filters = { page, pageSize: 10 };
	const { data, isLoading } = useRequestHistory(organizationId, callerId, filters);

	const requests = data?.requests ?? [];
	const total = data?.total ?? 0;

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Loading history…</p>;
	}

	return (
		<div className="space-y-6">
			<DashboardGreeting
				title="Request history"
				subtitle="Past requests and how each one ended."
				action={
					<Button asChild variant="outline" className="rounded-xl">
						<Link href="/hospital/requests">Active requests</Link>
					</Button>
				}
			/>

			{requests.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center">
					<Archive className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-3 text-sm font-bold text-foreground">No history yet</p>
					<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
						Fulfilled, closed and cancelled requests will appear here with their
						outcomes.
					</p>
				</div>
			) : (
				<>
					<ul className="space-y-3">
						{requests.map((request) => (
							<li
								key={request.requestId}
								className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4"
							>
								<BloodTypeBadge bloodGroup={request.bloodGroup} />
								<div className="min-w-0 flex-1">
									<Link
										href={`/hospital/requests/${request.requestId}`}
										className="truncate text-sm font-bold text-foreground hover:underline"
									>
										{request.bloodGroup} · {request.unitsAccepted}/
										{request.unitsRequired} units
									</Link>
									<p className="mt-0.5 text-xs text-muted-foreground">
										{request.locationName} · {request.notifiedCount} donors
										notified · ended{" "}
										{request.closedAt
											? new Date(request.closedAt).toLocaleDateString()
											: "—"}
									</p>
								</div>
								<StatusTag status={outcomeTone(request.status)}>{request.status}</StatusTag>
							</li>
						))}
					</ul>
					<PaginationControls
						page={page}
						totalPages={Math.ceil(total / filters.pageSize)}
						onPageChange={setPage}
					/>
				</>
			)}
		</div>
	);
}
