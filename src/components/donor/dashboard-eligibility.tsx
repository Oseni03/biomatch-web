"use client";

import { Calendar, Droplet, ShieldCheck } from "lucide-react";
import type { EligibilityResult } from "@/lib/eligibility";
import { nextDonationCopy } from "@/lib/donor-dashboard";
import { cn } from "@/lib/utils";
import {
	InfoCard,
	InfoTile,
} from "@/components/donor/dashboard-shared";

export function EligibilitySection({
	eligibility,
	nextEligibleLabel,
	bloodGroup,
	hasBloodGroup,
}: {
	eligibility: EligibilityResult;
	nextEligibleLabel: string | null;
	bloodGroup: string;
	hasBloodGroup: boolean;
}) {
	return (
		<InfoCard
			icon={ShieldCheck}
			iconClassName="text-status-ok"
			title="Donation Eligibility"
			meta={
				<span
					className={cn(
						"rounded-full border px-2.5 py-0.5 text-xs font-semibold",
						eligibility.eligible
							? "bg-status-ok-bg text-status-ok border-status-ok/20"
							: "bg-status-low-bg text-status-low border-status-low/20",
					)}
				>
					{eligibility.eligible ? "Eligible to Donate" : "Deferral Active"}
				</span>
			}
		>
			<div className="grid grid-cols-1 gap-3.5 pt-1 text-xs sm:grid-cols-2">
				<InfoTile
					icon={Calendar}
					iconClassName="text-status-info"
					label="Next Eligible Donation Date"
					value={
						eligibility.eligible
							? "Available Today"
							: `In ${eligibility.daysRemaining} days`
					}
					hint={nextDonationCopy(eligibility, nextEligibleLabel)}
				/>
				<InfoTile
					icon={Droplet}
					iconClassName="text-brand"
					label="Registered Blood Profile"
					value={<span className="font-mono text-brand">{bloodGroup}</span>}
					hint={
						hasBloodGroup
							? "Verified on the voluntary donor registry"
							: "Complete your profile to register your blood group"
					}
				/>
			</div>
		</InfoCard>
	);
}
