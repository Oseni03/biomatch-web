"use client";

import { Bell, ChevronUp } from "lucide-react";
import { displayBloodGroup } from "@/lib/donor-types";
import { useConfirmDonation } from "@/hooks/use-emergency-requests";

export interface StageConfig {
	key: string;
	label: string;
	icon: React.ElementType;
	color: string;
	bg: string;
	border: string;
}

interface StageAlert {
	id: string;
	status: string;
	updatedAt: Date;
	donor: {
		name: string | null;
		bloodGroup: string | null;
		location: string | null;
	};
}

interface DonorStageListProps {
	statusKey: string;
	config: StageConfig | undefined;
	alerts: StageAlert[];
	onClose: () => void;
}

export function DonorStageList({
	statusKey,
	config,
	alerts,
	onClose,
}: DonorStageListProps) {
	const confirmDonation = useConfirmDonation();
	const Icon = config?.icon ?? Bell;
	const filteredDonors = alerts.filter((a) => a.status === statusKey);

	const handleConfirm = (alertId: string, donorName: string | null) => {
		if (
			window.confirm(
				`Confirm donation for ${donorName}? This will update their donation record and award points.`,
			)
		) {
			confirmDonation.mutate({ alertId });
		}
	};

	return (
		<div className="border-border rounded-2xl overflow-hidden">
			<div
				className={`${config?.bg ?? ""} px-4 py-2 flex items-center justify-between border-b ${config?.border ?? ""}`}
			>
				<div className="flex items-center gap-2">
					<Icon className={`h-4 w-4 ${config?.color ?? ""}`} />
					<span className="text-sm font-semibold text-foreground">
						{config?.label} — {filteredDonors.length} donor
						{filteredDonors.length !== 1 ? "s" : ""}
					</span>
				</div>
				<button
					onClick={onClose}
					className="text-muted-foreground hover:text-muted-foreground cursor-pointer"
				>
					<ChevronUp className="h-4 w-4" />
				</button>
			</div>
			{filteredDonors.length === 0 ? (
				<p className="p-4 text-sm text-muted-foreground">
					No donors in this stage.
				</p>
			) : (
				<div className="divide-y divide-border">
					{filteredDonors.map((alert) => (
						<div
							key={alert.id}
							className="px-4 py-3 flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div
									className={`w-8 h-8 rounded-lg ${config?.bg ?? ""} flex items-center justify-center ${config?.color ?? ""} text-xs font-bold shrink-0`}
								>
									{alert.donor.name
										?.split(" ")
										.map((n: string) => n[0])
										.join("")
										.slice(0, 2)
										.toUpperCase() ?? "?"}
								</div>
								<div>
									<p className="text-sm font-medium text-foreground truncate">
										{alert.donor.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{displayBloodGroup(
											alert.donor.bloodGroup,
										)}{" "}
										&bull;{" "}
										{alert.donor.location ??
											"Location unknown"}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3 shrink-0">
								<span className="text-[10px] text-muted-foreground font-mono">
									{new Date(
										alert.updatedAt,
									).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
								{alert.status === "arrived" && (
									<button
										onClick={() =>
											handleConfirm(
												alert.id,
												alert.donor.name,
											)
										}
										disabled={confirmDonation.isPending}
										className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-[10px] font-medium rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
									>
										{confirmDonation.isPending
											? "Confirming..."
											: "Confirm Donation"}
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
