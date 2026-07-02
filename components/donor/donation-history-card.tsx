"use client";

import { Award } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import type { DonationRecord } from "@/lib/donor-types";

interface DonationHistoryCardProps {
	records: DonationRecord[];
}

export function DonationHistoryCard({ records }: DonationHistoryCardProps) {
	return (
		<Card className="bg-card border-border rounded-3xl p-6 shadow-sm">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<Award className="h-5 w-5 text-brand" />
					Personal Donation History
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Complete record of your verified life-saving contributions
				</CardDescription>
			</CardHeader>

			<CardContent className="p-0">
				{records.length === 0 ? (
					<div className="text-sm text-muted-foreground p-6 text-center">
						You haven&apos;t logged any donations yet. Go on your
						first active mission to start tracking your impact!
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-xs text-left">
							<thead>
								<tr className="border-border text-muted-foreground font-mono uppercase">
									<th className="py-3 px-2">Date</th>
									<th className="py-3 px-2">Hospital</th>
									<th className="py-3 px-2">Group</th>
									<th className="py-3 px-2 text-right">
										Status
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
								{records.map((rec) => (
									<tr
										key={rec.id}
										className="hover:bg-muted"
									>
										<td className="py-3.5 px-2 font-mono text-muted-foreground">
											{rec.date}
										</td>
										<td className="py-3.5 px-2 font-semibold text-foreground">
											{rec.hospitalName}
										</td>
										<td className="py-3.5 px-2 font-mono">
											{rec.bloodType}
										</td>
										<td className="py-3.5 px-2 text-right">
											<span className="px-2 py-0.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-md font-mono text-[9px] uppercase font-bold border border-green-100 dark:border-green-900/40">
												{rec.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
