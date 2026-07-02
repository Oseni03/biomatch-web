"use client";

import { useState } from "react";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useEligibleDonors } from "@/hooks/use-eligible-donors";
import { EligibleDonorsList } from "@/components/donor/eligible-donors-list";
import type { EligibleDonor } from "@/components/donor/eligible-donors-list";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const BLOOD_GROUPS = [
	{ value: "A_PLUS", label: "A+" },
	{ value: "A_MINUS", label: "A-" },
	{ value: "B_PLUS", label: "B+" },
	{ value: "B_MINUS", label: "B-" },
	{ value: "AB_PLUS", label: "AB+" },
	{ value: "AB_MINUS", label: "AB-" },
	{ value: "O_PLUS", label: "O+" },
	{ value: "O_MINUS", label: "O-" },
] as const;

export default function DonorFinderPage() {
	const [bloodGroup, setBloodGroup] = useState<string>("");
	const [location, setLocation] = useState("");
	const [search, setSearch] = useState("");
	const [eligibleOnly, setEligibleOnly] = useState(false);
	const [page, setPage] = useState(1);

	const filters = {
		...(bloodGroup ? { bloodGroup: bloodGroup as any } : {}),
		...(location ? { location } : {}),
		...(search ? { search } : {}),
		...(eligibleOnly ? { eligibleOnly: true } : {}),
		page,
		pageSize: 10,
	};

	const { data, isLoading, isFetching } = useEligibleDonors(filters);

	const donors: EligibleDonor[] = (data?.donors ?? []).map((d) => ({
		id: d.id,
		name: d.name,
		bloodGroup: d.bloodGroup,
		genotype: d.genotype,
		location: d.location,
		lastDonationDate: d.lastDonationDate?.toISOString() ?? null,
	}));

	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / 10);

	const handleSearch = () => {
		setPage(1);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleSearch();
	};

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-2xl font-bold text-foreground">
					BioMatch Donor Finder
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Search and filter eligible donors by blood group, location,
					or name.
				</p>
			</header>

			<div className="rounded-xl border border-border bg-white p-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
							Blood Group
						</label>
						<Select
							value={bloodGroup}
							onValueChange={(v) => {
								setBloodGroup(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="All groups" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All groups</SelectItem>
								{BLOOD_GROUPS.map((bg) => (
									<SelectItem key={bg.value} value={bg.value}>
										{bg.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
							Location
						</label>
						<Input
							placeholder="e.g. Lagos, Abuja..."
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</div>

					<div>
						<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
							Donor Name
						</label>
						<Input
							placeholder="Search by name..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</div>

					<div className="flex items-end gap-3">
						<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted has-checked:border-rose-300 has-checked:bg-brand-light has-checked:text-brand">
							<input
								type="checkbox"
								checked={eligibleOnly}
								onChange={(e) => {
									setEligibleOnly(e.target.checked);
									setPage(1);
								}}
								className="size-4 rounded border-input text-brand focus:ring-ring"
							/>
							Eligible only (56+ days)
						</label>
						<button
							onClick={handleSearch}
							disabled={isFetching}
							className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
						>
							<Search className="h-4 w-4" />
							Search
						</button>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="rounded-xl border border-border bg-white p-5">
					<div className="mb-4 h-5 w-48 animate-pulse rounded bg-muted" />
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="h-12 animate-pulse rounded bg-muted"
							/>
						))}
					</div>
				</div>
			) : donors.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white px-5 py-16">
					<Users className="mb-3 h-10 w-10 text-muted-foreground" />
					<h3 className="text-sm font-semibold text-foreground">
						No donors match your search
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Try adjusting your filters or search criteria.
					</p>
				</div>
			) : (
				<>
					<p className="text-sm text-muted-foreground">
						Showing{" "}
						<span className="font-medium text-foreground">
							{donors.length}
						</span>{" "}
						of{" "}
						<span className="font-medium text-foreground">
							{total}
						</span>{" "}
						donor
						{total !== 1 ? "s" : ""}
					</p>

					<EligibleDonorsList donors={donors} />

					{totalPages > 1 && (
						<div className="flex items-center justify-center gap-2 pt-2">
							<button
								onClick={() =>
									setPage((p) => Math.max(1, p - 1))
								}
								disabled={page <= 1}
								className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
							>
								<ChevronLeft className="h-4 w-4" />
								Previous
							</button>

							<div className="flex items-center gap-1">
								{Array.from({
									length: Math.min(totalPages, 7),
								}).map((_, i) => {
									let pageNum: number;
									if (totalPages <= 7) {
										pageNum = i + 1;
									} else if (page <= 4) {
										pageNum = i + 1;
									} else if (page >= totalPages - 3) {
										pageNum = totalPages - 6 + i;
									} else {
										pageNum = page - 3 + i;
									}
									return (
										<button
											key={pageNum}
											onClick={() => setPage(pageNum)}
											className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
												pageNum === page
													? "bg-brand text-white"
													: "text-muted-foreground hover:bg-muted"
											}`}
										>
											{pageNum}
										</button>
									);
								})}
							</div>

							<button
								onClick={() =>
									setPage((p) => Math.min(totalPages, p + 1))
								}
								disabled={page >= totalPages}
								className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
							>
								Next
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
