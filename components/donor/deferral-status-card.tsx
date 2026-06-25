"use client";

import { CheckCircle } from "lucide-react";
import { Calendar } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ELIGIBILITY_DAYS } from "@/lib/eligibility";
import type { EligibilityResult } from "@/lib/eligibility";

interface DeferralStatusCardProps {
	eligibility: EligibilityResult;
	lastDonationDate: string | null;
	lastDonationDateInput: string;
	onDateChange: (date: string) => void;
	deferralPercent: number;
}

export function DeferralStatusCard({
	eligibility,
	lastDonationDate,
	lastDonationDateInput,
	onDateChange,
	deferralPercent,
}: DeferralStatusCardProps) {
	return (
		<Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
			<CardHeader className="p-0 pb-4 border-b border-gray-50 dark:border-zinc-800/60 mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<Calendar className="h-5 w-5 text-red-600" />
					Donation Deferral Status
				</CardTitle>
				<CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
					{ELIGIBILITY_DAYS}-day standard voluntary recovery countdown
				</CardDescription>
			</CardHeader>

			<CardContent className="p-0 flex flex-col items-center">
				<div className="relative w-40 h-40 mb-6">
					<svg className="w-full h-full transform -rotate-90">
						<circle
							cx="80"
							cy="80"
							r="70"
							className="stroke-gray-100 dark:stroke-zinc-800"
							strokeWidth="10"
							fill="transparent"
						/>
						<circle
							cx="80"
							cy="80"
							r="70"
							className="stroke-red-600 dark:stroke-red-500 transition-all duration-1000"
							strokeWidth="10"
							strokeDasharray={439.8}
							strokeDashoffset={
								439.8 - (439.8 * deferralPercent) / 100
							}
							strokeLinecap="round"
							fill="transparent"
						/>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
						{!eligibility.eligible ? (
							<>
								<span className="text-4xl font-bold font-mono tracking-tighter text-red-600 dark:text-red-400">
									{eligibility.daysRemaining}
								</span>
								<span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">
									Days Left
								</span>
							</>
						) : (
							<>
								<CheckCircle className="h-10 w-10 text-green-500 animate-pulse mb-1" />
								<span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
									Eligible Now
								</span>
							</>
						)}
					</div>
				</div>

				<div className="w-full space-y-4">
					<div className="p-3.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl text-xs space-y-2 text-left">
						<div className="flex justify-between">
							<span className="text-gray-400 font-mono">
								LAST DONATION:
							</span>
							<span className="font-semibold text-gray-800 dark:text-white font-mono">
								{lastDonationDate ?? "N/A"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-400 font-mono">
								ELIGIBLE DATE:
							</span>
							<span className="font-semibold text-gray-800 dark:text-white font-mono">
								{lastDonationDate
									? (() => {
											const d = new Date(
												lastDonationDate,
											);
											d.setDate(
												d.getDate() + ELIGIBILITY_DAYS,
											);
											return d
												.toISOString()
												.split("T")[0];
										})()
									: "Now"}
							</span>
						</div>
					</div>

					<div>
						<label className="block text-[10px] font-mono uppercase text-gray-400 mb-2 tracking-wider text-left">
							Manually Update Last Donation Date:
						</label>
						<input
							type="date"
							value={lastDonationDateInput}
							onChange={(e) => onDateChange(e.target.value)}
							max={new Date().toISOString().split("T")[0]}
							className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
