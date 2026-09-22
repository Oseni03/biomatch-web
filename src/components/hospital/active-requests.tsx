"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, Pencil } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
	useActiveRequests,
	useCancelRequest,
	useCloseRequest,
	useUpdateRequest,
} from "@/hooks/use-hospital-requests";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function ActiveRequestsClient({ organizationId }: { organizationId: string }) {
	const { data: session } = authClient.useSession();
	const callerId = session?.user?.id;
	const [page, setPage] = useState(1);
	const filters = { page, pageSize: 10 };
	const { data, isLoading } = useActiveRequests(organizationId, callerId, filters);
	const update = useUpdateRequest(organizationId, callerId ?? "");
	const close = useCloseRequest(organizationId, callerId ?? "");
	const cancel = useCancelRequest(organizationId, callerId ?? "");
	const [error, setError] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [units, setUnits] = useState("");
	const [locationName, setLocationName] = useState("");

	const requests = data?.requests ?? [];
	const total = data?.total ?? 0;
	const acting = update.isPending || close.isPending || cancel.isPending;

	async function run(action: Promise<unknown>, failure: string) {
		setError(null);
		try {
			await action;
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : failure);
		}
	}

	function openEditor(requestId: string, currentUnits: number, currentLocation: string) {
		setEditingId(requestId);
		setUnits(String(currentUnits));
		setLocationName(currentLocation);
		setError(null);
	}

	async function saveEdit() {
		if (!editingId) return;
		await run(
			update.mutateAsync({
				requestId: editingId,
				input: {
					unitsRequired: Number(units),
					locationName: locationName.trim() || undefined,
				},
			}),
			"Could not update this request",
		);
		if (!error) setEditingId(null);
	}

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Loading active requests…</p>;
	}

	return (
		<div className="space-y-6">
			<DashboardGreeting
				title="Active requests"
				subtitle="Open blood requests you can edit, close or cancel."
				action={
					<Button asChild variant="outline" className="rounded-xl">
						<Link href="/hospital/requests/history">View history</Link>
					</Button>
				}
			/>

			{error && (
				<p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive">
					{error}
				</p>
			)}

			{requests.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center">
					<Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-3 text-sm font-bold text-foreground">No active requests</p>
					<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
						When your hospital needs blood, create a request and it will show up
						here until it is fulfilled, closed or cancelled.
					</p>
					<Button asChild className="mt-4 rounded-xl">
						<Link href="/hospital/emergency">Create a request</Link>
					</Button>
				</div>
			) : (
				<>
					<ul className="space-y-3">
						{requests.map((request) => (
							<li
								key={request.requestId}
								className="rounded-2xl border border-border bg-card p-4"
							>
								<div className="flex flex-wrap items-center gap-3">
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
											notified · {Number(request.currentRadiusKm).toFixed(0)} km
											radius
										</p>
									</div>
									<StatusTag status="info">active</StatusTag>
								</div>
								<div className="mt-3 flex flex-wrap gap-2">
									<Button
										size="sm"
										variant="outline"
										className="rounded-xl"
										disabled={acting}
										onClick={() =>
											openEditor(
												request.requestId,
												request.unitsRequired,
												request.locationName,
											)
										}
									>
										<Pencil className="mr-1 h-3 w-3" />
										Edit
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="rounded-xl"
										disabled={acting}
										onClick={() =>
											run(
												close.mutateAsync(request.requestId),
												"Could not close this request",
											)
										}
									>
										{close.isPending ? "Closing…" : "Close"}
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="rounded-xl text-destructive"
										disabled={acting}
										onClick={() => {
											if (
												window.confirm(
													"Cancel this request? Matched donors will be told it is no longer open.",
												)
											) {
												void run(
													cancel.mutateAsync(request.requestId),
													"Could not cancel this request",
												);
											}
										}}
									>
										{cancel.isPending ? "Cancelling…" : "Cancel"}
									</Button>
								</div>
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

			<Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
				<DialogContent className="rounded-2xl">
					<DialogHeader>
						<DialogTitle>Edit request</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="edit-units">Units needed</Label>
							<Input
								id="edit-units"
								type="number"
								min={1}
								max={100}
								value={units}
								onChange={(event) => setUnits(event.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="edit-location">Location</Label>
							<Input
								id="edit-location"
								value={locationName}
								onChange={(event) => setLocationName(event.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							className="rounded-xl"
							onClick={() => setEditingId(null)}
						>
							Discard
						</Button>
						<Button
							className="rounded-xl"
							disabled={update.isPending}
							onClick={() => void saveEdit()}
						>
							{update.isPending ? "Saving…" : "Save changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
