"use client";

import { useState } from "react";
import { Bell, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { displayBloodGroup } from "@/lib/donor-types";
import { useConfirmDonation } from "@/hooks/use-emergency-requests";
import {
	useScreeningForAlert,
	useCreateScreening,
	useResolveScreening,
} from "@/hooks/use-screening";
import { authClient } from "@/lib/auth-client";
import { ScreeningFailurePrompt } from "@/components/hospital/screening-failure-prompt";

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
	donorConfirmedAt: Date | null;
	hospitalConfirmedAt: Date | null;
	donor: {
		id: string;
		name: string | null;
		bloodGroup: string | null;
		location: string | null;
	};
}

interface DonorStageListProps {
	statusKey: string;
	config: StageConfig | undefined;
	alerts: StageAlert[];
	organizationId: string;
	onClose: () => void;
}

export function DonorStageList({
	statusKey,
	config,
	alerts,
	organizationId,
	onClose,
}: DonorStageListProps) {
	const Icon = config?.icon ?? Bell;
	const filteredDonors = alerts.filter((a) => a.status === statusKey);

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
									<ArrivedStageAction
										alertId={alert.id}
										donorId={alert.donor.id}
										donorName={alert.donor.name}
										organizationId={organizationId}
										hospitalConfirmedAt={alert.hospitalConfirmedAt}
									/>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function ArrivedStageAction({
	alertId,
	donorId,
	donorName,
	organizationId,
	hospitalConfirmedAt,
}: {
	alertId: string;
	donorId: string;
	donorName: string | null;
	organizationId: string;
	hospitalConfirmedAt: Date | null;
}) {
	const { data: session } = authClient.useSession();
	const staffUserId = session?.user?.id;
	const { data: screening, isLoading } = useScreeningForAlert(alertId);
	const createScreening = useCreateScreening();
	const resolveScreening = useResolveScreening();
	const confirmDonation = useConfirmDonation();
	const [showFailurePrompt, setShowFailurePrompt] = useState(false);

	if (isLoading || !staffUserId) {
		return (
			<div className="h-8 w-28 animate-pulse rounded bg-muted" />
		);
	}

	if (screening?.status === "pending") {
		if (showFailurePrompt) {
			return (
				<ScreeningFailurePrompt
					isPending={resolveScreening.isPending}
					onCancel={() => setShowFailurePrompt(false)}
					onConfirm={(consequence) =>
						resolveScreening.mutate({
							screeningId: screening.id,
							status: "failed",
							callerUserId: staffUserId,
							donorId,
							alertId,
							consequence,
						})
					}
				/>
			);
		}

		return (
			<div className="flex items-center gap-2">
				<Button
					size="sm"
					disabled={resolveScreening.isPending}
					className="h-auto px-3 py-1.5 text-[10px] bg-status-ok text-white hover:bg-status-ok hover:opacity-90 hover:scale-100"
					onClick={() =>
						resolveScreening.mutate({
							screeningId: screening.id,
							status: "passed",
							callerUserId: staffUserId,
							donorId,
							alertId,
						})
					}
				>
					Mark Passed
				</Button>
				<Button
					size="sm"
					variant="destructive"
					disabled={resolveScreening.isPending}
					className="h-auto px-3 py-1.5 text-[10px]"
					onClick={() => setShowFailurePrompt(true)}
				>
					Mark Failed
				</Button>
			</div>
		);
	}

	if (hospitalConfirmedAt) {
		return (
			<span className="text-xs text-status-info">
				Waiting for donor confirmation
			</span>
		);
	}

	if (screening?.status === "passed") {
		return (
			<Button
				size="sm"
				disabled={confirmDonation.isPending}
				className="h-auto px-3 py-1.5 text-[10px] bg-status-ok text-white hover:bg-status-ok hover:opacity-90 hover:scale-100"
				onClick={() => {
					if (
						window.confirm(
							`Confirm donation for ${donorName}? This will update their donation record and award points.`,
						)
					) {
						confirmDonation.mutate({ alertId, staffUserId });
					}
				}}
			>
				{confirmDonation.isPending ? "Confirming..." : "Confirm Donation"}
			</Button>
		);
	}

	return (
		<Button
			size="sm"
			disabled={createScreening.isPending}
			className="h-auto px-3 py-1.5 text-[10px]"
			onClick={() =>
				createScreening.mutate({
					donorId,
					organizationId,
					staffUserId,
					alertId,
				})
			}
		>
			{createScreening.isPending ? "Starting..." : "Screen Donor"}
		</Button>
	);
}
