"use client";

import { Fragment, useState } from "react";
import { Search, ShieldCheck, ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEligibleDonors } from "@/hooks/use-eligible-donors";
import { useMyStaffRole } from "@/hooks/use-staff";
import {
	useDonorVerificationStatus,
	useActiveScreening,
	useCreateScreening,
	useResolveScreening,
} from "@/hooks/use-screening";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { StatusTag } from "@/components/brand/status-tag";
import type { VerificationStatus } from "@/servers/screening";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const VERIFICATION_LABEL: Record<
	VerificationStatus,
	{ label: string; status: "ok" | "low" | "critical" | "info" }
> = {
	verified: { label: "Verified", status: "ok" },
	pending: { label: "Pending", status: "info" },
	failed: { label: "Failed", status: "critical" },
	unverified: { label: "Unverified", status: "low" },
};

interface DirectoryDonor {
	id: string;
	name: string;
	bloodGroup: string | null;
}

export function DonorScreeningPanel({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data: session } = authClient.useSession();
	const staffUserId = session?.user?.id;
	const { data: myRole } = useMyStaffRole(staffUserId);
	const canRecord =
		myRole === "admin" || myRole === "requester" || myRole === "owner";

	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [expandedDonorId, setExpandedDonorId] = useState<string | null>(
		null,
	);

	const filters = {
		...(searchQuery ? { search: searchQuery } : {}),
		page,
		pageSize: PAGE_SIZE,
	};

	const { data, isLoading } = useEligibleDonors(filters);
	const donors: DirectoryDonor[] = data?.donors ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / PAGE_SIZE);

	return (
		<Card className="bg-card border-border rounded-xl p-6 shadow-sm animate-in fade-in duration-300 text-left transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-lg font-bold flex items-center gap-2">
					<ShieldCheck className="h-5 w-5 text-brand" />
					Donor Screening
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Record walk-in blood screenings and resolve pending
					results
					{!canRecord &&
						" — your staff role is read-only for screenings"}
				</CardDescription>
			</CardHeader>

			<div className="relative mb-6 max-w-sm">
				<span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
					<Search className="h-4 w-4" />
				</span>
				<input
					type="text"
					placeholder="Search donor by name..."
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
						setPage(1);
					}}
					className="w-full pl-10 pr-4 py-2.5 bg-muted border-border rounded-xl text-xs"
				/>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="h-12 animate-pulse rounded bg-muted"
						/>
					))}
				</div>
			) : donors.length === 0 ? (
				<div className="py-10 text-center text-sm text-muted-foreground">
					No matching donors found.
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-xs text-left">
						<thead>
							<tr className="border-border text-muted-foreground uppercase font-mono tracking-wider">
								<th className="py-3 px-3" />
								<th className="py-3 px-3">Donor Name</th>
								<th className="py-3 px-3">Blood Type</th>
								<th className="py-3 px-3">Verification</th>
								<th className="py-3 px-3 text-right">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{donors.map((donor) => (
								<DonorScreeningRow
									key={donor.id}
									donor={donor}
									isExpanded={expandedDonorId === donor.id}
									onToggle={() =>
										setExpandedDonorId(
											expandedDonorId === donor.id
												? null
												: donor.id,
										)
									}
									canRecord={canRecord}
									organizationId={organizationId}
									staffUserId={staffUserId!}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}

			{totalPages > 1 && (
				<div className="mt-6">
					<PaginationControls
						page={page}
						totalPages={totalPages}
						onPageChange={setPage}
						variant="numbered"
					/>
				</div>
			)}
		</Card>
	);
}

function DonorScreeningRow({
	donor,
	isExpanded,
	onToggle,
	canRecord,
	organizationId,
	staffUserId,
}: {
	donor: DirectoryDonor;
	isExpanded: boolean;
	onToggle: () => void;
	canRecord: boolean;
	organizationId: string;
	staffUserId: string;
}) {
	const { data: verificationStatus } = useDonorVerificationStatus(donor.id);
	const badge =
		VERIFICATION_LABEL[verificationStatus ?? "unverified"];

	return (
		<Fragment>
			<tr
				className="hover:bg-muted transition cursor-pointer"
				onClick={onToggle}
			>
				<td className="py-4 px-3 w-6">
					<ChevronDown
						className={cn(
							"h-3.5 w-3.5 text-muted-foreground transition-transform",
							isExpanded && "rotate-180",
						)}
					/>
				</td>
				<td className="py-4 px-3 font-semibold text-foreground">
					{donor.name}
				</td>
				<td className="py-4 px-3">
					{donor.bloodGroup ? (
						<BloodTypeBadge bloodGroup={donor.bloodGroup} size="sm" />
					) : (
						"—"
					)}
				</td>
				<td className="py-4 px-3">
					<StatusTag status={badge.status}>{badge.label}</StatusTag>
				</td>
				<td className="py-4 px-3 text-right text-muted-foreground text-[10px]">
					{isExpanded ? "Hide" : "Manage"}
				</td>
			</tr>
			{isExpanded && (
				<tr>
					<td colSpan={5} className="bg-muted/50 px-3 py-4">
						<ScreeningActions
							donorId={donor.id}
							organizationId={organizationId}
							staffUserId={staffUserId}
							canRecord={canRecord}
						/>
					</td>
				</tr>
			)}
		</Fragment>
	);
}

function ScreeningActions({
	donorId,
	organizationId,
	staffUserId,
	canRecord,
}: {
	donorId: string;
	organizationId: string;
	staffUserId: string;
	canRecord: boolean;
}) {
	const [notes, setNotes] = useState("");
	const { data: activeScreening, isLoading } = useActiveScreening(donorId);
	const createScreening = useCreateScreening();
	const resolveScreening = useResolveScreening();

	if (isLoading) {
		return <div className="h-8 animate-pulse rounded bg-muted" />;
	}

	if (!canRecord) {
		return (
			<p className="text-xs text-muted-foreground">
				Your staff role is read-only and cannot record or resolve
				screenings.
			</p>
		);
	}

	if (!activeScreening) {
		return (
			<Button
				size="sm"
				onClick={() =>
					createScreening.mutate({
						donorId,
						organizationId,
						staffUserId,
					})
				}
				disabled={createScreening.isPending}
			>
				{createScreening.isPending ? "Starting..." : "Start Screening"}
			</Button>
		);
	}

	return (
		<div className="space-y-3 max-w-md">
			<p className="text-xs text-muted-foreground">
				Pending screening opened{" "}
				{new Date(activeScreening.screenedAt).toLocaleDateString()}.
				Record the result once lab results are back.
			</p>
			<Textarea
				placeholder="Optional note..."
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				className="text-xs"
			/>
			<div className="flex gap-2">
				<Button
					size="sm"
					className="bg-status-ok text-white hover:bg-status-ok hover:opacity-90"
					disabled={resolveScreening.isPending}
					onClick={() =>
						resolveScreening.mutate({
							screeningId: activeScreening.id,
							status: "passed",
							callerUserId: staffUserId,
							notes,
							donorId,
						})
					}
				>
					Mark Passed
				</Button>
				<Button
					size="sm"
					variant="destructive"
					disabled={resolveScreening.isPending}
					onClick={() =>
						resolveScreening.mutate({
							screeningId: activeScreening.id,
							status: "failed",
							callerUserId: staffUserId,
							notes,
							donorId,
						})
					}
				>
					Mark Failed
				</Button>
			</div>
		</div>
	);
}
