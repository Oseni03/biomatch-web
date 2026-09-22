"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminDonorListItem } from "@/servers/admin";

const BLOOD_GROUPS = ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"];
const VERIFICATION_STATUSES = ["unverified", "verified", "failed"];
const ACCOUNT_STATUSES = ["active", "restricted"];

function queryString(filters: Record<string, string>, page: number): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		if (value) params.set(key, value);
	}
	if (page > 1) params.set("page", String(page));
	const query = params.toString();
	return query ? `/admin/donors?${query}` : "/admin/donors";
}

export function DonorsClient({
	donors,
	page,
	totalPages,
	total,
	filters,
}: {
	donors: AdminDonorListItem[];
	page: number;
	totalPages: number;
	total: number;
	filters: { search: string; blood: string; verification: string; state: string; status: string };
}) {
	const router = useRouter();
	const [search, setSearch] = useState(filters.search);
	const [blood, setBlood] = useState(filters.blood);
	const [verification, setVerification] = useState(filters.verification);
	const [state, setState] = useState(filters.state);
	const [status, setStatus] = useState(filters.status);

	function applyFilters() {
		router.push(queryString({ search, blood, verification, state, status }, 1));
	}

	function clearFilters() {
		setSearch("");
		setBlood("");
		setVerification("");
		setState("");
		setStatus("");
		router.push("/admin/donors");
	}

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-border bg-card p-6">
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<div className="space-y-1">
						<label htmlFor="donor-search" className="text-xs font-semibold text-muted-foreground">
							Search name, email or donor code
						</label>
						<Input
							id="donor-search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="e.g. Adaeze or BIOMATCH-042"
							className="rounded-xl"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="donor-blood" className="text-xs font-semibold text-muted-foreground">
							Blood group
						</label>
						<select
							id="donor-blood"
							value={blood}
							onChange={(event) => setBlood(event.target.value)}
							className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
						>
							<option value="">All groups</option>
							{BLOOD_GROUPS.map((group) => (
								<option key={group} value={group}>
									{group.replace("_POS", "+").replace("_NEG", "-")}
								</option>
							))}
						</select>
					</div>
					<div className="space-y-1">
						<label htmlFor="donor-verification" className="text-xs font-semibold text-muted-foreground">
							Verification
						</label>
						<select
							id="donor-verification"
							value={verification}
							onChange={(event) => setVerification(event.target.value)}
							className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
						>
							<option value="">All statuses</option>
							{VERIFICATION_STATUSES.map((value) => (
								<option key={value} value={value}>
									{value}
								</option>
							))}
						</select>
					</div>
					<div className="space-y-1">
						<label htmlFor="donor-state" className="text-xs font-semibold text-muted-foreground">
							State
						</label>
						<Input
							id="donor-state"
							value={state}
							onChange={(event) => setState(event.target.value)}
							placeholder="e.g. Lagos"
							className="rounded-xl"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="donor-status" className="text-xs font-semibold text-muted-foreground">
							Account status
						</label>
						<select
							id="donor-status"
							value={status}
							onChange={(event) => setStatus(event.target.value)}
							className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
						>
							<option value="">Active + restricted</option>
							{ACCOUNT_STATUSES.map((value) => (
								<option key={value} value={value}>
									{value}
								</option>
							))}
						</select>
					</div>
					<div className="flex items-end gap-2">
						<Button type="button" onClick={applyFilters} className="rounded-xl">
							Search
						</Button>
						<Button type="button" variant="outline" onClick={clearFilters} className="rounded-xl">
							Clear
						</Button>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<p className="text-sm text-muted-foreground">
					{total} donor{total === 1 ? "" : "s"} found
				</p>
				{donors.length > 0 && (
					<ul className="mt-4 divide-y divide-border">
						{donors.map((donor) => (
							<li key={donor.userId} className="flex items-center gap-3 py-3">
								<div className="min-w-0 flex-1">
									<Link
										href={`/admin/donors/${donor.userId}`}
										className="truncate text-sm font-bold text-foreground hover:underline"
									>
										{donor.name || donor.email}
									</Link>
									<p className="truncate text-xs text-muted-foreground">
										{donor.donorCode} · {donor.bloodGroup.replace("_POS", "+").replace("_NEG", "-")} ·{" "}
										{donor.state ?? "No state"} · {donor.verificationStatus}
									</p>
								</div>
								<StatusTag status={donor.donorStatus === "restricted" ? "critical" : "ok"}>
									{donor.donorStatus}
								</StatusTag>
							</li>
						))}
					</ul>
				)}
				<div className="mt-4 flex items-center justify-between text-sm">
					<span className="text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					<div className="flex gap-2">
						{page > 1 && (
							<Link
								href={queryString(filters, page - 1)}
								className="rounded-lg border border-border px-3 py-1.5 font-semibold text-foreground hover:bg-muted"
							>
								Previous
							</Link>
						)}
						{page < totalPages && (
							<Link
								href={queryString(filters, page + 1)}
								className="rounded-lg border border-border px-3 py-1.5 font-semibold text-foreground hover:bg-muted"
							>
								Next
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
