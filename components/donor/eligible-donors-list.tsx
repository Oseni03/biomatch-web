import { Users, MapPin } from "lucide-react";

export interface EligibleDonor {
	id: string;
	name: string;
	bloodGroup: string | null;
	genotype?: string | null;
	location?: string | null;
	lastDonationDate: string | null;
}

interface EligibleDonorsListProps {
	donors: EligibleDonor[];
}

function getEligibilityStatus(lastDonationDate: string | null) {
	if (!lastDonationDate) return { label: "Eligible", class: "bg-emerald-50 text-emerald-700" };
	const daysSince = Math.floor(
		(Date.now() - new Date(lastDonationDate).getTime()) / (1000 * 60 * 60 * 24),
	);
	return daysSince >= 56
		? { label: "Eligible", class: "bg-emerald-50 text-emerald-700" }
		: { label: "Recently Donated", class: "bg-amber-50 text-amber-700" };
}

export function EligibleDonorsList({ donors }: EligibleDonorsListProps) {
	return (
		<section className="rounded-xl border border-gray-200 bg-white">
			<div className="flex items-center gap-2 border-b px-5 py-4">
				<Users className="h-4.5 w-4.5 text-rose-600" />
				<h2 className="text-sm font-semibold text-gray-900">
					Eligible BioMatch Donors
				</h2>
				<span className="ml-auto text-xs text-gray-400">
					Last donation 56+ days ago or never donated
				</span>
			</div>
			{donors.length === 0 ? (
				<p className="px-5 py-6 text-sm text-gray-400">
					No eligible donors found right now.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
								<th className="px-5 py-3 font-medium">Name</th>
								<th className="px-5 py-3 font-medium">Blood Group</th>
								<th className="px-5 py-3 font-medium">Genotype</th>
								<th className="px-5 py-3 font-medium">Location</th>
								<th className="px-5 py-3 font-medium">Last Donation</th>
								<th className="px-5 py-3 font-medium">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{donors.map((donor) => {
								const status = getEligibilityStatus(donor.lastDonationDate);
								return (
									<tr key={donor.id} className="hover:bg-gray-50">
										<td className="px-5 py-3 font-medium text-gray-900">
											{donor.name}
										</td>
										<td className="px-5 py-3">
											<span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
												{donor.bloodGroup ?? "—"}
											</span>
										</td>
										<td className="px-5 py-3 text-gray-600">
											{donor.genotype ?? "—"}
										</td>
										<td className="px-5 py-3 text-gray-600">
											{donor.location ? (
												<span className="inline-flex items-center gap-1">
													<MapPin className="h-3.5 w-3.5 text-gray-400" />
													{donor.location}
												</span>
											) : (
												"—"
											)}
										</td>
										<td className="px-5 py-3 text-gray-600">
											{donor.lastDonationDate
												? new Date(donor.lastDonationDate).toLocaleDateString()
												: "Never"}
										</td>
										<td className="px-5 py-3">
											<span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.class}`}>
												{status.label}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
