import { Award } from "lucide-react";
import { displayBloodGroup } from "@/lib/donor-types";
import { POINTS_PER_DONATION } from "@/lib/constants";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface DonationRecord {
	id: string;
	date: string;
	hospitalName: string;
	bloodGroup: string;
}

interface DonationHistoryTableProps {
	records: DonationRecord[];
	total: number;
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function DonationHistoryTable({
	records,
	total,
	page,
	totalPages,
	onPageChange,
}: DonationHistoryTableProps) {
	return (
		<div className="bg-white dark:bg-card border border-border dark:border-border rounded-3xl p-6 shadow-sm">
			<div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-border/60 mb-4">
				<div className="flex items-center gap-2">
					<Award className="h-5 w-5 text-brand" />
					<h2 className="text-base font-bold text-foreground">
						Donation History
					</h2>
				</div>
			</div>

			{records.length === 0 ? (
				<div className="text-sm text-muted-foreground p-6 text-center">
					No donation history yet. Complete an emergency response to
					start tracking your impact.
				</div>
			) : (
				<>
					<div className="overflow-x-auto">
						<table className="w-full text-xs text-left">
							<thead>
								<tr className="border-b border-border dark:border-border text-muted-foreground font-mono uppercase">
									<th className="py-3 px-2">Date</th>
									<th className="py-3 px-2">Hospital</th>
									<th className="py-3 px-2">Blood Group</th>
									<th className="py-3 px-2 text-right">
										Points
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
								{records.map((rec) => (
									<tr
										key={rec.id}
										className="hover:bg-muted/50 dark:hover:bg-zinc-850/20"
									>
										<td className="py-3.5 px-2 font-mono text-muted-foreground">
											{rec.date}
										</td>
										<td className="py-3.5 px-2 font-semibold text-foreground">
											{rec.hospitalName}
										</td>
										<td className="py-3.5 px-2 font-mono">
											{displayBloodGroup(rec.bloodGroup)}
										</td>
										<td className="py-3.5 px-2 text-right font-mono text-green-600 font-semibold">
											{POINTS_PER_DONATION}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="mt-6 pt-4 border-t border-border dark:border-border">
						<PaginationControls
							page={page}
							totalPages={totalPages}
							onPageChange={onPageChange}
						/>
					</div>
				</>
			)}

			<div className="mt-4 pt-4 border-t border-border dark:border-border text-xs text-muted-foreground flex items-center gap-2">
				<span>
					<strong className="font-semibold text-foreground dark:text-muted-foreground">
						{total}
					</strong>{" "}
					total donation{total !== 1 ? "s" : ""}
				</span>
				<span>&bull;</span>
				<span>
					<strong className="font-semibold text-foreground dark:text-muted-foreground">
						{POINTS_PER_DONATION}
					</strong>{" "}
					points per donation
				</span>
			</div>
		</div>
	);
}
