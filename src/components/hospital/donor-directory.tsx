"use client";

import { useState } from "react";
import { Users, Search, Phone } from "lucide-react";
import { useEligibleDonors } from "@/hooks/use-eligible-donors";
import { getEligibility } from "@/lib/eligibility";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

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
	const [eligibleOnly, setEligibleOnly] = useState(false);

	const filters = {
		...(searchBlood && BLOOD_GROUP_VALUES[searchBlood]
			? { bloodGroup: BLOOD_GROUP_VALUES[searchBlood] as any }
			: {}),
		...(searchQuery ? { search: searchQuery } : {}),
		...(eligibleOnly ? { eligibleOnly: true } : {}),
		page: 1,
		pageSize: 50,
	};

	const { data, isLoading } = useEligibleDonors(filters);
	const donors = data?.donors ?? [];

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

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
				<div className="relative md:col-span-2">
					<span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
						<Search className="h-4 w-4" />
					</span>
					<input
						type="text"
						placeholder="Search by name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 bg-muted border-border rounded-xl text-xs"
					/>
				</div>

				<div>
					<select
						value={searchBlood}
						onChange={(e) => setSearchBlood(e.target.value)}
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
					<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs text-foreground transition-colors hover:bg-muted has-checked:border-rose-300 has-checked:bg-brand-light has-checked:text-brand w-full">
						<input
							type="checkbox"
							checked={eligibleOnly}
							onChange={(e) => setEligibleOnly(e.target.checked)}
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
								return (
									<tr key={donor.id} className="hover:bg-muted transition">
										<td className="py-4 px-3">
											<span className="font-semibold text-foreground block">
												{donor.name}
											</span>
											<span className="text-[10px] text-muted-foreground font-mono">
												{donor.email ?? ""}
											</span>
										</td>
										<td className="py-4 px-3">
											<span className="px-2.5 py-0.5 bg-brand-light text-brand font-mono font-bold rounded-md">
												{donor.bloodGroup ?? "—"}
											</span>
										</td>
										<td className="py-4 px-3 font-medium text-muted-foreground">
											{donor.location ?? "—"}
										</td>
										<td className="py-4 px-3">
											<span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold ${
												eligible ? "text-green-600" : "text-amber-600"
											}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${
													eligible ? "bg-green-500" : "bg-amber-500"
												}`} />
												{eligible ? "Eligible" : "Deferred"}
											</span>
										</td>
										<td className="py-4 px-3 text-right">
											<button className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl text-[11px] inline-flex items-center gap-1 shadow-sm transition cursor-pointer">
												<Phone className="h-3 w-3" />
												Contact
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</Card>
	);
}
