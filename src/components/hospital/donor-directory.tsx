"use client";

import { Fragment, useState } from "react";
import { Users, Search, Phone, ChevronDown, Droplet } from "lucide-react";
import { useEligibleDonors } from "@/hooks/use-eligible-donors";
import { useDonorDonations } from "@/hooks/use-donations";
import { getEligibility } from "@/lib/eligibility";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { StatusTag } from "@/components/brand/status-tag";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const BLOOD_GROUPS = [
	"", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const;

const BLOOD_GROUP_VALUES: Record<string, string> = {
	"A+": "A_PLUS",
	"A-": "A_MINUS",
	"B+": "B_PLUS",
	"B-": "B_MINUS",
	"AB+": "AB_PLUS",
	"AB-": "AB_MINUS",
	"O+": "O_PLUS",
	"O-": "O_MINUS",
};

export function DonorDirectory() {
	const [searchBlood, setSearchBlood] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [location, setLocation] = useState("");
	const [eligibleOnly, setEligibleOnly] = useState(false);
	const [page, setPage] = useState(1);
	const [expandedDonorId, setExpandedDonorId] = useState<string | null>(null);

	const filters = {
		...(searchBlood && BLOOD_GROUP_VALUES[searchBlood]
			? { bloodGroup: BLOOD_GROUP_VALUES[searchBlood] as any }
			: {}),
		...(searchQuery ? { search: searchQuery } : {}),
		...(location ? { location } : {}),
		...(eligibleOnly ? { eligibleOnly: true } : {}),
		page,
		pageSize: PAGE_SIZE,
	};

	const { data, isLoading } = useEligibleDonors(filters);
	const donors = data?.donors ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / PAGE_SIZE);

	return (
		<Card className="bg-card border-border rounded-xl p-6 shadow-sm animate-in fade-in duration-300 text-left transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-lg font-bold flex items-center gap-2">
					<Users className="h-5 w-5 text-brand" />
					Proactive Volunteer Registry Search
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Search registered donors by blood type, name, or eligibility status
				</CardDescription>
			</CardHeader>

			<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
				<div className="relative md:col-span-2">
					<span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
						<Search className="h-4 w-4" />
					</span>
					<input
						type="text"
						placeholder="Search by name..."
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setPage(1);
						}}
						className="w-full pl-10 pr-4 py-2.5 bg-muted border-border rounded-xl text-xs"
					/>
				</div>

				<div>
					<input
						type="text"
						placeholder="Location, e.g. Lagos..."
						value={location}
						onChange={(e) => {
							setLocation(e.target.value);
							setPage(1);
						}}
						className="w-full px-3 py-2.5 bg-muted border-border rounded-xl text-xs"
					/>
				</div>

				<div>
					<select
						value={searchBlood}
						onChange={(e) => {
							setSearchBlood(e.target.value);
							setPage(1);
						}}
						className="w-full px-3 py-2.5 bg-muted border-border rounded-xl text-xs font-medium"
					>
						<option value="">All Blood Types</option>
						{BLOOD_GROUPS.filter(Boolean).map((v) => (
							<option key={v} value={v}>
								Group {v}
							</option>
						))}
					</select>
				</div>

				<div className="flex items-end">
					<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs text-foreground transition-colors hover:bg-muted has-checked:border-brand/30 has-checked:bg-brand-light has-checked:text-brand w-full">
						<input
							type="checkbox"
							checked={eligibleOnly}
							onChange={(e) => {
								setEligibleOnly(e.target.checked);
								setPage(1);
							}}
							className="size-4 rounded border-input text-brand focus:ring-ring"
						/>
						Eligible only
					</label>
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="h-12 animate-pulse rounded bg-muted" />
					))}
				</div>
			) : donors.length === 0 ? (
				<div className="py-10 text-center text-sm text-muted-foreground">
					No matching registered donors found. Adjust filters to broaden your search.
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-xs text-left">
						<thead>
							<tr className="border-border text-muted-foreground uppercase font-mono tracking-wider">
								<th className="py-3 px-3" />
								<th className="py-3 px-3">Donor Name</th>
								<th className="py-3 px-3">Blood Type</th>
								<th className="py-3 px-3">Location</th>
								<th className="py-3 px-3">Eligibility</th>
								<th className="py-3 px-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{donors.map((donor) => {
								const eligible = getEligibility(
									donor.lastDonationDate
										? new Date(donor.lastDonationDate).toISOString()
										: null,
								).eligible;
								const isExpanded = expandedDonorId === donor.id;
								return (
									<Fragment key={donor.id}>
										<tr
											className="hover:bg-muted transition cursor-pointer"
											onClick={() =>
												setExpandedDonorId(
													isExpanded ? null : donor.id,
												)
											}
										>
											<td className="py-4 px-3 w-6">
												<ChevronDown
													className={cn(
														"h-3.5 w-3.5 text-muted-foreground transition-transform",
														isExpanded && "rotate-180",
													)}
												/>
											</td>
											<td className="py-4 px-3">
												<span className="font-semibold text-foreground block">
													{donor.name}
												</span>
												<span className="text-[10px] text-muted-foreground font-mono">
													{donor.email ?? ""}
												</span>
											</td>
											<td className="py-4 px-3">
												{donor.bloodGroup ? (
													<BloodTypeBadge
														bloodGroup={donor.bloodGroup}
														size="sm"
													/>
												) : (
													"—"
												)}
											</td>
											<td className="py-4 px-3 font-medium text-muted-foreground">
												{donor.location ?? "—"}
											</td>
											<td className="py-4 px-3">
												<StatusTag status={eligible ? "ok" : "low"}>
													{eligible ? "Eligible" : "Deferred"}
												</StatusTag>
											</td>
											<td className="py-4 px-3 text-right">
												<Button
													size="sm"
													onClick={(e) => e.stopPropagation()}
												>
													<Phone className="h-3 w-3" />
													Contact
												</Button>
											</td>
										</tr>
										{isExpanded && (
											<tr>
												<td colSpan={6} className="bg-muted/50 px-3 py-4">
													<DonationHistoryPanel donorId={donor.id} />
												</td>
											</tr>
										)}
									</Fragment>
								);
							})}
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

function DonationHistoryPanel({ donorId }: { donorId: string }) {
	const { data: donations, isLoading } = useDonorDonations(donorId, true);

	if (isLoading) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<div key={i} className="h-8 animate-pulse rounded bg-muted" />
				))}
			</div>
		);
	}

	if (!donations || donations.length === 0) {
		return (
			<div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
				<Droplet className="h-3.5 w-3.5" />
				No donations yet
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
				Donation History
			</h4>
			<table className="w-full text-xs text-left">
				<thead>
					<tr className="text-muted-foreground">
						<th className="py-1.5 pr-3 font-medium">Date</th>
						<th className="py-1.5 pr-3 font-medium">Blood Type</th>
						<th className="py-1.5 pr-3 font-medium">Hospital</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{donations.map((donation) => (
						<tr key={donation.id}>
							<td className="py-2 pr-3 font-mono text-muted-foreground">
								{new Date(donation.donatedAt).toLocaleDateString()}
							</td>
							<td className="py-2 pr-3">
								<BloodTypeBadge
									bloodGroup={donation.bloodGroup}
									size="sm"
								/>
							</td>
							<td className="py-2 pr-3 text-foreground">
								{donation.hospitalBank?.hospitalName ?? "—"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
