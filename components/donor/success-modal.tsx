"use client";

import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SuccessModalProps {
	isOpen: boolean;
	completedCount: number;
	onUpdateRecords: () => void;
}

export function SuccessModal({
	isOpen,
	completedCount,
	onUpdateRecords,
}: SuccessModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
			<Card className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative text-center">
				<div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
					<CheckCircle className="h-10 w-10" />
				</div>

				<h3 className="text-2xl font-bold tracking-tight">
					Mission Fulfilled!
				</h3>
				<p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
					You have successfully arrived at the hospital checkpoint.
					The medical staff has processed your donation, and your
					profile is now updated!
				</p>

				<div className="my-6 p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl text-left text-xs space-y-1.5">
					<div className="flex justify-between">
						<span className="text-gray-400">
							HMO Milestone Count:
						</span>
						<span className="font-bold text-gray-800 dark:text-white">
							{completedCount} -- {completedCount + 1}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-gray-400">Insurance Status:</span>
						<span className="font-bold text-green-600">
							{completedCount + 1 >= 3
								? "Premium Tier Gold"
								: "Basic Tier Active"}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-gray-400">
							Eligibility Deferral:
						</span>
						<span className="font-bold text-red-500">
							56 days recovery reset
						</span>
					</div>
				</div>

				<button
					onClick={onUpdateRecords}
					className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-sm transition"
				>
					Update My Records
				</button>
			</Card>
		</div>
	);
}
