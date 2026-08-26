"use client";

import { motion } from "framer-motion";
import { Users, MapPin, Droplet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/brand/status-tag";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import {
	compactContainerVariants,
	compactCardVariants,
} from "@/lib/animations";

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
	if (!lastDonationDate)
		return { label: "Eligible", status: "ok" as const };
	const daysSince = Math.floor(
		(Date.now() - new Date(lastDonationDate).getTime()) /
			(1000 * 60 * 60 * 24),
	);
	return daysSince >= 56
		? { label: "Eligible", status: "ok" as const }
		: { label: "Recently Donated", status: "low" as const };
}

export function EligibleDonorsList({ donors }: EligibleDonorsListProps) {
	return (
		<section className="rounded-xl border border-border bg-card">
			<div className="flex items-center gap-2 border-b border-border px-5 py-4">
				<Users className="h-4.5 w-4.5 text-brand" />
				<h2 className="text-sm font-semibold text-foreground">
					Eligible BioMatch Donors
				</h2>
				<span className="ml-auto text-xs text-muted-foreground">
					Last donation 56+ days ago or never donated
				</span>
			</div>
			{donors.length === 0 ? (
				<div className="flex flex-col items-center justify-center px-5 py-10 text-center">
					<Users className="mb-2 h-6 w-6 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						No eligible donors found right now.
					</p>
				</div>
			) : (
				<motion.div
					className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3"
					variants={compactContainerVariants}
					initial="hidden"
					animate="visible"
				>
					{donors.map((donor) => {
						const status = getEligibilityStatus(
							donor.lastDonationDate,
						);
						return (
							<motion.div key={donor.id} variants={compactCardVariants}>
								<Card className="flex items-start gap-3 p-4 transition-shadow hover:shadow-card-hover">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light">
										<Droplet
											className="h-5 w-5 text-brand"
											fill="currentColor"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<p className="truncate text-sm font-semibold text-foreground">
												{donor.name}
											</p>
											<StatusTag
												status={status.status}
												className="shrink-0"
											>
												{status.label}
											</StatusTag>
										</div>
										<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
											{donor.bloodGroup ? (
												<BloodTypeBadge
													bloodGroup={donor.bloodGroup}
													size="sm"
												/>
											) : (
												<span>{"\u2014"}</span>
											)}
											{donor.genotype && (
												<span className="inline-flex items-center gap-1">
													Geno: {donor.genotype}
												</span>
											)}
											<span className="inline-flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												{donor.location ?? "\u2014"}
											</span>
											<span>
												Last:{" "}
												{donor.lastDonationDate
													? new Date(
															donor.lastDonationDate,
														).toLocaleDateString()
													: "Never"}
											</span>
										</div>
									</div>
								</Card>
							</motion.div>
						);
					})}
				</motion.div>
			)}
		</section>
	);
}
