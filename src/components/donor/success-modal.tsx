"use client";

import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
			<Card className="w-full max-w-md bg-card border-border rounded-3xl p-6 shadow-2xl relative text-center">
				<div className="w-16 h-16 bg-status-ok-bg rounded-full flex items-center justify-center mx-auto mb-4 text-status-ok">
					<CheckCircle className="h-10 w-10" />
				</div>

				<h3 className="text-2xl font-bold tracking-tight">
					Mission Fulfilled!
				</h3>
				<p className="text-sm text-muted-foreground mt-2 leading-relaxed">
					You have successfully arrived at the hospital checkpoint.
					The medical staff has processed your donation, and your
					profile is now updated!
				</p>

				<div className="my-6 p-4 bg-muted border-border rounded-2xl text-left text-xs space-y-1.5">
					<div className="flex justify-between">
						<span className="text-muted-foreground">
							Lifetime Donations:
						</span>
						<span className="font-bold text-foreground">
							{completedCount} &rarr; {completedCount + 1}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">
							Wallet Points:
						</span>
						<span className="font-bold text-status-ok">
							Awarded
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">
							Eligibility Deferral:
						</span>
						<span className="font-bold text-brand">
							56 days recovery reset
						</span>
					</div>
				</div>

				<Button onClick={onUpdateRecords} className="w-full" size="lg">
					Update My Records
				</Button>
			</Card>
		</div>
	);
}
