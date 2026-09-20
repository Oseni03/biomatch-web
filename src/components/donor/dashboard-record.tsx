"use client";

import { Heart } from "lucide-react";
import { InfoCard } from "@/components/donor/dashboard-shared";

export function DonationRecordSection({
	lifetimeDonations,
}: {
	lifetimeDonations: number;
}) {
	return (
		<InfoCard
			icon={Heart}
			iconClassName="text-brand"
			title="Verified Donation Record"
			meta={
				<span className="text-[11px] text-muted-foreground">BioMATCH Ledger</span>
			}
		>
			<div className="rounded-xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
				{lifetimeDonations > 0 ? (
					<p>
						{lifetimeDonations}{" "}
						{lifetimeDonations === 1
							? "verified donation has"
							: "verified donations have"}{" "}
						been recorded on your donor profile. Verified clinical donation logs
						and certificates are updated directly by the attending hospital blood
						bank after each completed session.
					</p>
				) : (
					<p>
						No verified hospital donations logged yet. When you complete an
						emergency donation at a verified hospital, your official clinical
						record and donor credentials will appear here.
					</p>
				)}
			</div>
		</InfoCard>
	);
}
