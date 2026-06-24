import { Users } from "lucide-react";

export interface EligibleDonor {
	id: string;
	name: string;
	bloodGroup: string | null;
	lastDonationDate: string | null;
}

interface EligibleDonorsListProps {
	donors: EligibleDonor[];
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
			<div className="divide-y">
				{donors.length === 0 ? (
					<p className="px-5 py-6 text-sm text-gray-400">
						No eligible donors found right now.
					</p>
				) : (
					donors.map((donor) => (
						<div
							key={donor.id}
							className="flex items-center justify-between px-5 py-3"
						>
							<div>
								<p className="text-sm font-medium text-gray-900">
									{donor.name}
								</p>
								<p className="text-xs text-gray-400">
									{donor.lastDonationDate
										? `Last donated ${new Date(donor.lastDonationDate).toLocaleDateString()}`
										: "No prior donation on record"}
								</p>
							</div>
							<span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
								{donor.bloodGroup ?? "Unknown"}
							</span>
						</div>
					))
				)}
			</div>
		</section>
	);
}
